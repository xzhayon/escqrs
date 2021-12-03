import { all, put, takeLatest } from 'typed-redux-saga'
import { $ScreenCreationSaga } from './creation/saga'
import { $ScreenCreation } from './creation/slice'
import { $ScreenDashboardSaga } from './dashboard/saga'
import { $ScreenDashboard } from './dashboard/slice'

function* coordinate() {
  yield* takeLatest($ScreenCreation.Created.type, function* () {
    yield* put($ScreenDashboard.FetchList())
  })
}

export function* $ScreenSaga() {
  yield* all([$ScreenDashboardSaga(), $ScreenCreationSaga(), coordinate()])
}
