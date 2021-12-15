import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { ArcadiaClient } from '../../ArcadiaClient'
import { $ScreeningDashboard } from './slice'

function* fetchScreenings(
  command: ReturnType<typeof $ScreeningDashboard.fetchScreenings>,
) {
  yield* put($ScreeningDashboard.ScreeningsFetchingStarted())
  try {
    const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
    const screenings = yield* call(arcadia.getScreeningsByFilm)
    yield* put($ScreeningDashboard.ScreeningsFetched(screenings))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, screenings))
  } catch (error: any) {
    yield* put($ScreeningDashboard.ScreeningsNotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $ScreeningDashboardSaga() {
  yield* takeLeading($ScreeningDashboard.start.type, function* () {
    yield* put($ScreeningDashboard.Started())
    const task = yield* takeLeading(
      $ScreeningDashboard.fetchScreenings.type,
      fetchScreenings,
    )
    yield* put($ScreeningDashboard.fetchScreenings())
    yield* take($ScreeningDashboard.stop.type)
    yield* cancel(task)
    yield* put($ScreeningDashboard.Stopped())
  })
}
