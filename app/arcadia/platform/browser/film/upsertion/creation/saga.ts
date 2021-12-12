import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { Id } from '../../../../../../../src/entity/Entity'
import { $Film, Film } from '../../../../../film/Film'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { Uuid } from '../../../uuid/Uuid'
import { $FilmCreation } from './slice'

const createFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmCreation.createFilm>) {
    yield* put($FilmCreation.FilmCreationStarted())
    try {
      const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
      const film = yield* call(arcadia.createFilm, {
        _: { id: filmId },
        title: command.payload.title,
      })
      yield* put($FilmCreation.FilmCreated(film))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
    } catch (error: any) {
      yield* put($FilmCreation.FilmNotCreated(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $FilmCreationSaga() {
  yield* takeLeading($FilmCreation.start.type, function* () {
    yield* put($FilmCreation.Started())
    const uuid = yield* getContext<Uuid>('uuid')
    const id = yield* call(uuid.v4)
    const task = yield* takeLeading(
      $FilmCreation.createFilm.type,
      createFilm($Film.id(id)),
    )
    yield* take($FilmCreation.stop.type)
    yield* cancel(task)
    yield* put($FilmCreation.Stopped())
  })
}
