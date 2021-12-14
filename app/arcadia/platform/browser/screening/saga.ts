import { all, put, takeLatest } from 'typed-redux-saga'
import { $ScreeningDashboardSaga } from './dashboard/saga'
import { $ScreeningDashboard } from './dashboard/slice'
import { $ScreeningCreation } from './upsertion/creation/slice'
import { $ScreeningUpsertionSaga } from './upsertion/saga'

function* coordinate() {
  yield* takeLatest(
    [$ScreeningCreation.ScreeningCreationAccepted.type],
    function* () {
      yield* put($ScreeningDashboard.fetchScreenings())
    },
  )
}

export function* $ScreeningSaga() {
  yield* all([
    $ScreeningDashboardSaga(),
    $ScreeningUpsertionSaga(),
    coordinate(),
  ])
}
