import { all } from 'typed-redux-saga'
import { $ScreeningDashboardSaga } from './dashboard/saga'
import { $ScreeningUpsertionSaga } from './upsertion/saga'

export function* $ScreeningSaga() {
  yield* all([$ScreeningDashboardSaga(), $ScreeningUpsertionSaga()])
}
