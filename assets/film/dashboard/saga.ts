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

function* fetchList(command: ReturnType<typeof $FilmDashboard['FetchList']>) {
  yield* put($FilmDashboard.ListFetchingStarted())
  try {
    const arcadiaClient: ArcadiaClient = yield getContext('arcadiaClient')
    const films = yield* call(arcadiaClient.getFilms)
    yield* put($FilmDashboard.ListFetched(films))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, films))
  } catch (error: any) {
    yield* put($FilmDashboard.ListNotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $FilmDashboardSaga() {
  yield* takeLeading($FilmDashboard.Start.type, function* () {
    yield* put($FilmDashboard.Started())
    const task = yield* takeLeading($FilmDashboard.FetchList.type, fetchList)
    yield* put($FilmDashboard.FetchList())
    yield* take($FilmDashboard.Stop.type)
    yield* cancel(task)
    yield* put($FilmDashboard.Stopped())
  })
}
