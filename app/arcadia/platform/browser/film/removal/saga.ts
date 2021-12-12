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

const fetchDetail = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmRemoval.FetchDetail>) {
    yield* put($FilmRemoval.DetailFetchingStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const film = yield* call(arcadiaClient.getFilm, filmId)
      yield* put($FilmRemoval.DetailFetched(film))
      command.payload?.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
    } catch (error: any) {
      yield* put($FilmRemoval.DetailNotFetched(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

const removeFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmRemoval.Remove>) {
    yield* put($FilmRemoval.RemovalStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      yield* call(arcadiaClient.removeFilm, filmId)
      yield* put($FilmRemoval.Removed())
      command.payload?.onSuccess && (yield* call(command.payload.onSuccess))
    } catch (error: any) {
      yield* put($FilmRemoval.NotRemoved(error))
      command.payload?.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $FilmRemovalSaga() {
  yield* takeLeading(
    $FilmRemoval.Start.type,
    function* ({ payload: { id } }: ReturnType<typeof $FilmRemoval.Start>) {
      yield* put($FilmRemoval.Started())
      const task = yield* fork(function* () {
        yield* all([
          takeLeading($FilmRemoval.FetchDetail.type, fetchDetail(id)),
          takeLeading($FilmRemoval.Remove.type, removeFilm(id)),
        ])
      })
      yield* put($FilmRemoval.FetchDetail())
      yield* take($FilmRemoval.Stop.type)
      yield* cancel(task)
      yield* put($FilmRemoval.Stopped())
    },
  )
}
