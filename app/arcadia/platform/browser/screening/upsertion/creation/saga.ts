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
import { $Screening, Screening } from '../../../../../screening/Screening'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { Uuid } from '../../../uuid/Uuid'
import { $ScreeningCreation } from './slice'

function* fetchFilmsAndScreens(
  command: ReturnType<typeof $ScreeningCreation.fetchFilmsAndScreens>,
) {
  yield* put($ScreeningCreation.FilmsAndScreensFetchingStarted())
  try {
    const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
    const [films, screens] = yield* all([
      call(arcadia.getFilms),
      call(arcadia.getScreens),
    ] as const)
    yield* put($ScreeningCreation.FilmsAndScreensFetched({ films, screens }))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, { films, screens }))
  } catch (error: any) {
    yield* put($ScreeningCreation.FilmsAndScreensNotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

const createScreening = (screeningId: Id<Screening>) =>
  function* (command: ReturnType<typeof $ScreeningCreation.createScreening>) {
    yield* put($ScreeningCreation.ScreeningCreationStarted())
    try {
      const client = yield* getContext<ArcadiaClient>('arcadiaClient')
      yield* call(
        client.createScreening,
        screeningId,
        command.payload.filmId,
        command.payload.screenId,
        command.payload.date,
      )
      yield* put($ScreeningCreation.ScreeningCreated())
      command.payload?.onSuccess && (yield* call(command.payload.onSuccess))
    } catch (error: any) {
      yield* put($ScreeningCreation.ScreeningNotCreated(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $ScreeningCreationSaga() {
  yield* takeLeading($ScreeningCreation.start.type, function* () {
    yield* put($ScreeningCreation.Started())
    const uuid = yield* getContext<Uuid>('uuid')
    const id = yield* call(uuid.v4)
    const task = yield* fork(function* () {
      yield* all([
        takeLeading(
          $ScreeningCreation.fetchFilmsAndScreens.type,
          fetchFilmsAndScreens,
        ),
        takeLeading(
          $ScreeningCreation.createScreening.type,
          createScreening($Screening.id(id)),
        ),
      ])
    })
    yield* put($ScreeningCreation.fetchFilmsAndScreens())
    yield* take($ScreeningCreation.stop.type)
    yield* cancel(task)
    yield* put($ScreeningCreation.Stopped())
  })
}
