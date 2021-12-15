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
import { Id } from '../../../../../../src/entity/Entity'
import { Screen } from '../../../../screen/Screen'
import { ArcadiaClient } from '../../ArcadiaClient'
import { $ScreenRemoval } from './slice'

const fetchScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenRemoval.fetchScreen>) {
    yield* put($ScreenRemoval.ScreenFetchingStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const screen = yield* call(arcadiaClient.getScreen, screenId)
      yield* put($ScreenRemoval.ScreenFetched(screen))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenRemoval.ScreenNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const removeScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenRemoval.removeScreen>) {
    yield* put($ScreenRemoval.ScreenRemovalStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      yield* call(arcadia.removeScreen, screenId)
      yield* put($ScreenRemoval.ScreenRemoved())
      command.payload?.onSuccess && (yield* call(command.payload.onSuccess))
    } catch (error: any) {
      yield* put($ScreenRemoval.ScreenNotRemoved(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenRemovalSaga() {
  yield* takeLeading(
    $ScreenRemoval.start.type,
    function* ({ payload: { id } }: ReturnType<typeof $ScreenRemoval.start>) {
      yield* put($ScreenRemoval.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($ScreenRemoval.fetchScreen.type, fetchScreen(id)),
          takeLeading($ScreenRemoval.removeScreen.type, removeScreen(id)),
        ])
      })
      yield* put($ScreenRemoval.fetchScreen())
      yield* take($ScreenRemoval.stop.type)
      yield* cancel(task)
      yield* put($ScreenRemoval.Stopped())
    },
  )
}
