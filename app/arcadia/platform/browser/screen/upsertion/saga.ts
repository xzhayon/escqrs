import { all } from 'typed-redux-saga'
import { $ScreenCreationSaga } from './creation/saga'
import { $ScreenEditingSaga } from './editing/saga'

export function* $ScreenUpsertionSaga() {
  yield* all([$ScreenCreationSaga(), $ScreenEditingSaga()])
}
