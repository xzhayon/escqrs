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
import { Id } from '../../../../../../../src/entity/Entity'
import { Film } from '../../../../../film/Film'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { $FilmEditing } from './slice'

const fetchDetail = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmEditing.FetchDetail>) {
    yield* put($FilmEditing.DetailFetchingStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const film = yield* call(arcadiaClient.getFilm, filmId)
      yield* put($FilmEditing.DetailFetched(film))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
    } catch (error: any) {
      yield* put($FilmEditing.DetailNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const editScreen = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmEditing.Edit>) {
    yield* put($FilmEditing.EditingStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const film = yield* call(arcadiaClient.editFilm, {
        _: { id: filmId },
        title: command.payload.title,
      })
      yield* put($FilmEditing.Edited(film))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
    } catch (error: any) {
      yield* put($FilmEditing.NotEdited(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $FilmEditingSaga() {
  yield* takeLeading(
    $FilmEditing.Start.type,
    function* ({ payload: { id } }: ReturnType<typeof $FilmEditing.Start>) {
      yield* put($FilmEditing.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($FilmEditing.FetchDetail.type, fetchDetail(id)),
          takeLeading($FilmEditing.Edit.type, editScreen(id)),
        ])
      })
      yield* put($FilmEditing.FetchDetail())
      yield* take($FilmEditing.Stop.type)
      yield* cancel(task)
      yield* put($FilmEditing.Stopped())
    },
  )
}
