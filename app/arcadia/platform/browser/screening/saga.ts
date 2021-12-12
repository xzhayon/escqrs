import { all } from 'typed-redux-saga'
import { $ScreeningUpsertionSaga } from './upsertion/saga'

export function* $ScreeningSaga() {
  yield* all([$ScreeningUpsertionSaga()])
}
