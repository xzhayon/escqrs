import {
  all,
  call,
  cancel,
  fork,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { Id } from '../../../../../../src/entity/Entity'
import { Film } from '../../../../film/Film'
import { ArcadiaClient } from '../../ArcadiaClient'
import { $FilmRemoval } from './slice'

const fetchFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmRemoval.fetchFilm>) {
    yield* put($FilmRemoval.FilmFetchingStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      const film = yield* call(arcadia.getFilm, filmId)
      yield* put($FilmRemoval.FilmFetched(film))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
    } catch (error: any) {
      yield* put($FilmRemoval.FilmNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const removeFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmRemoval.removeFilm>) {
    yield* put($FilmRemoval.FilmRemovalStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      yield* call(arcadiaClient.removeFilm, filmId)
      yield* put($FilmRemoval.FilmRemoved())
      command.payload?.onSuccess && (yield* call(command.payload.onSuccess))
    } catch (error: any) {
      yield* put($FilmRemoval.FilmNotRemoved(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $FilmRemovalSaga() {
  yield* takeLeading(
    $FilmRemoval.start.type,
    function* ({ payload: { id } }: ReturnType<typeof $FilmRemoval.start>) {
      yield* put($FilmRemoval.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($FilmRemoval.fetchFilm.type, fetchFilm(id)),
          takeLeading($FilmRemoval.removeFilm.type, removeFilm(id)),
        ])
      })
      yield* put($FilmRemoval.fetchFilm())
      yield* take($FilmRemoval.stop.type)
      yield* cancel(task)
      yield* put($FilmRemoval.Stopped())
    },
  )
}
