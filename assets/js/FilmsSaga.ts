import { all, put, takeLatest } from 'typed-redux-saga'
import { $FilmCreationSaga } from './FilmCreationSaga'
import { FilmCreation } from './FilmCreationSlice'
import { $FilmListSaga } from './FilmListSaga'
import { FilmList } from './FilmListSlice'

function* coordinate() {
  yield* takeLatest(FilmCreation.Created.type, function* () {
    yield* put(FilmList.Fetch())
  })
}

export function* $FilmsSaga() {
  yield* all([$FilmListSaga(), $FilmCreationSaga(), coordinate()])
}
