import { all } from 'typed-redux-saga'
import { $ScreeningCreationSaga } from './creation/saga'

export function* $ScreeningUpsertionSaga() {
  yield* all([$ScreeningCreationSaga()])
}
