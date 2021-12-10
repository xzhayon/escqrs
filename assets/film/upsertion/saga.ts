import { all } from 'typed-redux-saga'
import { $FilmCreationSaga } from './creation/saga'
import { $FilmEditingSaga } from './editing/saga'

export function* $FilmUpsertionSaga() {
  yield* all([$FilmCreationSaga(), $FilmEditingSaga()])
}
