import { all, put, takeLatest } from 'typed-redux-saga'
import { $ScreenDashboardSaga } from './dashboard/saga'
import { $ScreenDashboard } from './dashboard/slice'
import { $ScreenRemovalSaga } from './removal/saga'
import { $ScreenRemoval } from './removal/slice'
import { $ScreenCreation } from './upsertion/creation/slice'
import { $ScreenEditing } from './upsertion/editing/slice'
import { $ScreenUpsertionSaga } from './upsertion/saga'

function* coordinate() {
  yield* takeLatest(
    [
      $ScreenCreation.Created.type,
      $ScreenEditing.Edited.type,
      $ScreenRemoval.Removed.type,
    ],
    function* () {
      yield* put($ScreenDashboard.FetchList())
    },
  )
}

export function* $ScreenSaga() {
  yield* all([
    $ScreenDashboardSaga(),
    $ScreenUpsertionSaga(),
    $ScreenRemovalSaga(),
    coordinate(),
  ])
}
