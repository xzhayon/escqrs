import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { $ScreenId, Screen } from '../../app/arcadia/Screen'
import { Id } from '../../src/Entity'
import { ScreenCreation } from './ScreenCreationSlice'
import { ScreenService } from './ScreenService'
import { UuidService } from './UuidService'

const createScreen = (screenId: Id<Screen>) =>
  function* (command: ReturnType<typeof ScreenCreation['Create']>) {
    yield* put(ScreenCreation.CreationStarted())
    try {
      const screenService: ScreenService = yield getContext('screenService')
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
      yield* call(screenService.create, screen)
      yield* put(ScreenCreation.Created(screen))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, screen))
    } catch (error: any) {
      yield* put(ScreenCreation.NotCreated(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreenCreationSaga() {
  yield* takeLeading(ScreenCreation.Start.type, function* () {
    yield* put(ScreenCreation.Started())
    const uuidService: UuidService = yield getContext('uuidService')
    const uuid = yield* call(uuidService.v4)
    const task = yield* takeLeading(
      ScreenCreation.Create.type,
      createScreen($ScreenId(uuid)),
    )
    yield* take(ScreenCreation.Stop.type)
    yield* cancel(task)
    yield* put(ScreenCreation.Stopped())
  })
}
