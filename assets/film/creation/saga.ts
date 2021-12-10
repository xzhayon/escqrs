import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { $Film, Film } from '../../../app/arcadia/Film'
import { Id } from '../../../src/entity/Entity'
import { ArcadiaClient } from '../../ArcadiaClient'
import { Uuid } from '../../uuid/Uuid'
import { $FilmCreation } from './slice'

const createFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmCreation.Create>) {
    yield* put($FilmCreation.CreationStarted())
    try {
      const arcadiaClient = yield* getContext<ArcadiaClient>('arcadiaClient')
      const date = new Date()
      const film: Film = {
        _: {
          type: 'Film',
          id: filmId,
          date: { created: date, updated: date },
          version: -1,
        },
        title: command.payload.title,
      }
      yield* call(arcadiaClient.createFilm, film)
      yield* put($FilmCreation.Created(film))
      command.payload.onSuccess &&
        (yield* call(command.payload.onSuccess, film))
    } catch (error: any) {
      yield* put($FilmCreation.NotCreated(error))
      command.payload.onFailure &&
        (yield* call(command.payload.onFailure, error))
    }
  }

export function* $FilmCreationSaga() {
  yield* takeLeading($FilmCreation.Start.type, function* () {
    yield* put($FilmCreation.Started())
    const uuid = yield* getContext<Uuid>('uuid')
    const id = yield* call(uuid.v4)
    const task = yield* takeLeading(
      $FilmCreation.Create.type,
      createFilm($Film.id(id)),
    )
    yield* take($FilmCreation.Stop.type)
    yield* cancel(task)
    yield* put($FilmCreation.Stopped())
  })
}
