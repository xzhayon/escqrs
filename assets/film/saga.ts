import { all, put, takeLatest } from 'typed-redux-saga'
import { $FilmCreationSaga } from './creation/saga'
import { $FilmCreation } from './creation/slice'
import { $FilmDashboardSaga } from './dashboard/saga'
import { $FilmDashboard } from './dashboard/slice'

function* coordinate() {
  yield* takeLatest($FilmCreation.Created.type, function* () {
    yield* put($FilmDashboard.FetchList())
  })
}

export function* $FilmSaga() {
  yield* all([$FilmDashboardSaga(), $FilmCreationSaga(), coordinate()])
}
