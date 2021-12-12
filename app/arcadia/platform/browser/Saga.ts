import { all } from 'typed-redux-saga'
import { $FilmSaga } from './film/saga'
import { $ScreenSaga } from './screen/saga'
import { $ScreeningSaga } from './screening/saga'

export function* $Saga() {
  yield* all([$ScreenSaga(), $FilmSaga(), $ScreeningSaga()])
}
