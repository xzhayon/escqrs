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
      $ScreenCreation.ScreenCreated.type,
      $ScreenEditing.ScreenEdited.type,
      $ScreenRemoval.ScreenRemoved.type,
    ],
    function* () {
      yield* put($ScreenDashboard.fetchScreens())
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
