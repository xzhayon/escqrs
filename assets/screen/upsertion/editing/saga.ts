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
import { Screen } from '../../../../app/arcadia/Screen'
import { Id } from '../../../../src/entity/Entity'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { $ScreenEditing } from './slice'

const fetchDetail = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenEditing.FetchDetail>) {
    yield* put($ScreenEditing.DetailFetchingStarted())
    try {
      const arcadiaClient: ArcadiaClient = yield getContext('arcadiaClient')
      const screen = yield* call(arcadiaClient.getScreen, screenId)
      yield* put($ScreenEditing.DetailFetched(screen))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenEditing.DetailNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const editScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenEditing.Edit>) {
    yield* put($ScreenEditing.EditingStarted())
    try {
      const arcadiaClient: ArcadiaClient = yield getContext('arcadiaClient')
      const screen = yield* call(arcadiaClient.editScreen, {
        _: { id: screenId },
        name: command.payload.name,
        seats: command.payload.seats,
      })
      yield* put($ScreenEditing.Edited(screen))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenEditing.NotEdited(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenEditingSaga() {
  yield* takeLeading(
    $ScreenEditing.Start.type,
    function* ({ payload: { id } }: ReturnType<typeof $ScreenEditing.Start>) {
      yield* put($ScreenEditing.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($ScreenEditing.FetchDetail.type, fetchDetail(id)),
          takeLeading($ScreenEditing.Edit.type, editScreen(id)),
        ])
      })
      yield* put($ScreenEditing.FetchDetail())
      yield* take($ScreenEditing.Stop.type)
      yield* cancel(task)
      yield* put($ScreenEditing.Stopped())
    },
  )
}
