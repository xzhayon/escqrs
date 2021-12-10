import {
  all,
  call,
  cancel,
  fork,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { Screen } from '../../../app/arcadia/Screen'
import { Id } from '../../../src/entity/Entity'
import { ArcadiaClient } from '../../ArcadiaClient'
import { $ScreenRemoval } from './slice'

const fetchDetail = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenRemoval.FetchDetail>) {
    yield* put($ScreenRemoval.DetailFetchingStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const screen = yield* call(arcadiaClient.getScreen, screenId)
      yield* put($ScreenRemoval.DetailFetched(screen))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenRemoval.DetailNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const removeScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenRemoval.Remove>) {
    yield* put($ScreenRemoval.RemovalStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      yield* call(arcadiaClient.removeScreen, screenId)
      yield* put($ScreenRemoval.Removed())
      command.payload?.onSuccess && (yield* call(command.payload.onSuccess))
    } catch (error: any) {
      yield* put($ScreenRemoval.NotRemoved(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenRemovalSaga() {
  yield* takeLeading(
    $ScreenRemoval.Start.type,
    function* ({ payload: { id } }: ReturnType<typeof $ScreenRemoval.Start>) {
      yield* put($ScreenRemoval.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($ScreenRemoval.FetchDetail.type, fetchDetail(id)),
          takeLeading($ScreenRemoval.Remove.type, removeScreen(id)),
        ])
      })
      yield* put($ScreenRemoval.FetchDetail())
      yield* take($ScreenRemoval.Stop.type)
      yield* cancel(task)
      yield* put($ScreenRemoval.Stopped())
    },
  )
}
