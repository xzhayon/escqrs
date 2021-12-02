import { all, put, takeLatest } from 'typed-redux-saga'
import { $ScreenCreationSaga } from './ScreenCreationSaga'
import { ScreenCreation } from './ScreenCreationSlice'
import { $ScreenListSaga } from './ScreenListSaga copy'
import { ScreenList } from './ScreenListSlice'

function* coordinate() {
  yield* takeLatest(ScreenCreation.Created.type, function* () {
    yield* put(ScreenList.Fetch())
  })
}

export function* $ScreensSaga() {
  yield* all([$ScreenListSaga(), $ScreenCreationSaga(), coordinate()])
}
