import { all, put, takeLatest } from 'typed-redux-saga'
import { $FilmDashboardSaga } from './dashboard/saga'
import { $FilmDashboard } from './dashboard/slice'
import { $FilmRemovalSaga } from './removal/saga'
import { $FilmRemoval } from './removal/slice'
import { $FilmCreation } from './upsertion/creation/slice'
import { $FilmEditing } from './upsertion/editing/slice'
import { $FilmUpsertionSaga } from './upsertion/saga'

function* coordinate() {
  yield* takeLatest(
    [
      $FilmCreation.Created.type,
      $FilmEditing.Edited.type,
      $FilmRemoval.Removed.type,
    ],
    function* () {
      yield* put($FilmDashboard.FetchList())
    },
  )
}

export function* $FilmSaga() {
  yield* all([
    $FilmDashboardSaga(),
    $FilmUpsertionSaga(),
    $FilmRemovalSaga(),
    coordinate(),
  ])
}
