import { all, put, takeLatest } from 'typed-redux-saga'
import { $ScreeningDashboardSaga } from './dashboard/saga'
import { $ScreeningDashboard } from './dashboard/slice'
import { $ScreeningCreation } from './upsertion/creation/slice'
import { $ScreeningUpsertionSaga } from './upsertion/saga'

export function* fetchScreenings() {
  yield* put($ScreeningDashboard.fetchScreenings())
}

export function* coordinate() {
  yield* takeLatest(
    [$ScreeningCreation.ScreeningCreationAccepted.type],
    fetchScreenings,
  )
}

export function* $ScreeningSaga() {
  yield* all([
    $ScreeningDashboardSaga(),
    $ScreeningUpsertionSaga(),
    coordinate(),
  ])
}
