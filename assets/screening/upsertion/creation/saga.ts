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
import { $Screening, Screening } from '../../../../app/arcadia/Screening'
import { Id } from '../../../../src/entity/Entity'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { Uuid } from '../../../uuid/Uuid'
import { $ScreeningCreation } from './slice'

function* fetch(command: ReturnType<typeof $ScreeningCreation.Fetch>) {
  yield* put($ScreeningCreation.FetchingStarted())
  try {
    const client = yield* getContext<ArcadiaClient>('arcadiaClient')
    const [films, screens] = yield* all([
      call(client.getFilms),
      call(client.getScreens),
    ] as const)
    yield* put($ScreeningCreation.Fetched({ films, screens }))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, { films, screens }))
  } catch (error: any) {
    yield* put($ScreeningCreation.NotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

const createScreening = (screeningId: Id<Screening>) =>
  function* (command: ReturnType<typeof $ScreeningCreation.Create>) {
    yield* put($ScreeningCreation.CreationStarted())
    try {
      const client = yield* getContext<ArcadiaClient>('arcadiaClient')
      const screening = yield* call(
        client.createScreening,
        screeningId,
        command.payload.filmId,
        command.payload.screenId,
        command.payload.date,
      )
      yield* put($ScreeningCreation.Created(screening))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, screening))
    } catch (error: any) {
      yield* put($ScreeningCreation.NotCreated(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreeningCreationSaga() {
  yield* takeLeading($ScreeningCreation.Start.type, function* () {
    yield* put($ScreeningCreation.Started())
    const uuid = yield* getContext<Uuid>('uuid')
    const id = yield* call(uuid.v4)
    const task = yield* fork(function* () {
      yield* all([
        takeLeading($ScreeningCreation.Fetch.type, fetch),
        takeLeading(
          $ScreeningCreation.Create.type,
          createScreening($Screening.id(id)),
        ),
      ])
    })
    yield* put($ScreeningCreation.Fetch())
    yield* take($ScreeningCreation.Stop.type)
    yield* cancel(task)
    yield* put($ScreeningCreation.Stopped())
  })
}
