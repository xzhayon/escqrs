import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { FilmList } from './FilmListSlice'
import { FilmService } from './FilmService'

function* fetchFilms(command: ReturnType<typeof FilmList['Fetch']>) {
  yield* put(FilmList.FetchStarted())
  try {
    const filmService: FilmService = yield getContext('filmService')
    const films = yield* call(filmService.getMany)
    yield* put(FilmList.Fetched(films))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, films))
  } catch (error: any) {
    yield* put(FilmList.NotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $FilmListSaga() {
  yield* takeLeading(FilmList.Start.type, function* () {
    yield* put(FilmList.Started())
    const task = yield* takeLeading(FilmList.Fetch.type, fetchFilms)
    yield* put(FilmList.Fetch())
    yield* take(FilmList.Stop.type)
    yield* cancel(task)
    yield* put(FilmList.Stopped())
  })
}
