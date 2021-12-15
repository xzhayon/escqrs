import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { ArcadiaClient } from '../../ArcadiaClient'
import { $FilmDashboard } from './slice'

function* fetchFilms(command: ReturnType<typeof $FilmDashboard.fetchFilms>) {
  yield* put($FilmDashboard.FilmsFetchingStarted())
  try {
    const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
    const films = yield* call(arcadia.getFilms)
    yield* put($FilmDashboard.FilmsFetched(films))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, films))
  } catch (error: any) {
    yield* put($FilmDashboard.FilmsNotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $FilmDashboardSaga() {
  yield* takeLeading($FilmDashboard.start.type, function* () {
    yield* put($FilmDashboard.Started())
    const task = yield* takeLeading($FilmDashboard.fetchFilms.type, fetchFilms)
    yield* put($FilmDashboard.fetchFilms())
    yield* take($FilmDashboard.stop.type)
    yield* cancel(task)
    yield* put($FilmDashboard.Stopped())
  })
}
