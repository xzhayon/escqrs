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
import { Id } from '../../../../../../../src/entity/Entity'
import { Screen } from '../../../../../screen/Screen'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { $ScreenEditing } from './slice'

const fetchScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenEditing.fetchScreen>) {
    yield* put($ScreenEditing.ScreenFetchingStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      const screen = yield* call(arcadia.getScreen, screenId)
      yield* put($ScreenEditing.ScreenFetched(screen))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenEditing.ScreenNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const editScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenEditing.editScreen>) {
    yield* put($ScreenEditing.ScreenEditingStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      const screen = yield* call(arcadia.editScreen, {
        _: { id: screenId },
        name: command.payload.name,
        seats: command.payload.seats,
      })
      yield* put($ScreenEditing.ScreenEdited(screen))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenEditing.ScreenNotEdited(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenEditingSaga() {
  yield* takeLeading(
    $ScreenEditing.start.type,
    function* ({ payload: { id } }: ReturnType<typeof $ScreenEditing.start>) {
      yield* put($ScreenEditing.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($ScreenEditing.fetchScreen.type, fetchScreen(id)),
          takeLeading($ScreenEditing.editScreen.type, editScreen(id)),
        ])
      })
      yield* put($ScreenEditing.fetchScreen())
      yield* take($ScreenEditing.stop.type)
      yield* cancel(task)
      yield* put($ScreenEditing.Stopped())
    },
  )
}
