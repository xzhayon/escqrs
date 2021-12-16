import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { Id } from '../../../../../../../src/entity/Entity'
import { Film } from '../../../../../film/Film'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { $FilmEditing } from './slice'

export const fetchAndEdit = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmEditing.fetchFilm>) {
    yield* put($FilmEditing.FilmFetchingStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      const film = yield* call(arcadia.getFilm, filmId)
      yield* put($FilmEditing.FilmFetched(film))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
      yield* takeLeading($FilmEditing.editFilm.type, editFilm(filmId))
    } catch (error: any) {
      yield* put($FilmEditing.FilmNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export const editFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmEditing.editFilm>) {
    yield* put($FilmEditing.FilmEditingRequested())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      yield* call(arcadia.editFilm, filmId, { title: command.payload.title })
      yield* put($FilmEditing.FilmEditingAccepted())
      command.payload.onSuccess && (yield* call(command.payload.onSuccess))
    } catch (error: any) {
      yield* put($FilmEditing.FilmEditingRejected(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $FilmEditingSaga() {
  yield* takeLeading(
    $FilmEditing.start.type,
    function* ({ payload: { id } }: ReturnType<typeof $FilmEditing.start>) {
      yield* put($FilmEditing.Started())
      const task = yield* takeLeading(
        $FilmEditing.fetchFilm.type,
        fetchAndEdit(id),
      )
      yield* put($FilmEditing.fetchFilm())
      yield* take($FilmEditing.stop.type)
      yield* cancel(task)
      yield* put($FilmEditing.Stopped())
    },
  )
}
