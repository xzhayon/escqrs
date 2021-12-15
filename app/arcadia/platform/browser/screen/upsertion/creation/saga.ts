import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { Id } from '../../../../../../../src/entity/Entity'
import { $Screen, Screen } from '../../../../../screen/Screen'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { Uuid } from '../../../uuid/Uuid'
import { $ScreenCreation } from './slice'

const createScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenCreation.createScreen>) {
    yield* put($ScreenCreation.ScreenCreationStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      const screen = yield* call(arcadia.createScreen, screenId, {
        name: command.payload.name,
        seats: command.payload.seats,
      })
      yield* put($ScreenCreation.ScreenCreated(screen))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenCreation.ScreenNotCreated(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenCreationSaga() {
  yield* takeLeading($ScreenCreation.start.type, function* () {
    yield* put($ScreenCreation.Started())
    const uuid = yield* getContext<Uuid>('uuid')
    const id = yield* call(uuid.v4)
    const task = yield* takeLeading(
      $ScreenCreation.createScreen.type,
      createScreen($Screen.id(id)),
    )
    yield* take($ScreenCreation.stop.type)
    yield* cancel(task)
    yield* put($ScreenCreation.Stopped())
  })
}
