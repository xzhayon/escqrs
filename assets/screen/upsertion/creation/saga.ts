import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { $Screen, Screen } from '../../../../app/arcadia/Screen'
import { Id } from '../../../../src/entity/Entity'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { Uuid } from '../../../uuid/Uuid'
import { $ScreenCreation } from './slice'

const createScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof $ScreenCreation.Create>) {
    yield* put($ScreenCreation.CreationStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const date = new Date()
      const screen: Screen = {
        _: {
          type: 'Screen',
          id: screenId,
          date: { created: date, updated: date },
          version: -1,
        },
        name: command.payload.name,
        seats: command.payload.seats,
      }
      yield* call(arcadiaClient.createScreen, screen)
      yield* put($ScreenCreation.Created(screen))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put($ScreenCreation.NotCreated(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenCreationSaga() {
  yield* takeLeading($ScreenCreation.Start.type, function* () {
    yield* put($ScreenCreation.Started())
    const uuid = yield* getContext<Uuid>('uuid')
    const id = yield* call(uuid.v4)
    const task = yield* takeLeading(
      $ScreenCreation.Create.type,
      createScreen($Screen.id(id)),
    )
    yield* take($ScreenCreation.Stop.type)
    yield* cancel(task)
    yield* put($ScreenCreation.Stopped())
  })
}
