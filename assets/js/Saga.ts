import { all } from 'typed-redux-saga'
import { $FilmsSaga } from './FilmsSaga'
import { $ScreensSaga } from './ScreensSaga'

export function* $Saga() {
  yield* all([$FilmsSaga(), $ScreensSaga()])
}
