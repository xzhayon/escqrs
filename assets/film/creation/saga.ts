import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { $FilmId, Film } from '../../../app/arcadia/Film'
import { Id } from '../../../src/Entity'
import { $FilmCreation } from './slice'
import { FilmService } from '../FilmService'
import { UuidService } from '../../UuidService'

const createFilm = (filmId: Id<Film>) =>
  function* (command: ReturnType<typeof $FilmCreation['Create']>) {
    yield* put($FilmCreation.CreationStarted())
    try {
      const filmService: FilmService = yield getContext('filmService')
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
      yield* call(filmService.create, film)
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
    const uuidService: UuidService = yield getContext('uuidService')
    const uuid = yield* call(uuidService.v4)
    const task = yield* takeLeading(
      $FilmCreation.Create.type,
      createFilm($FilmId(uuid)),
    )
    yield* take($FilmCreation.Stop.type)
    yield* cancel(task)
    yield* put($FilmCreation.Stopped())
  })
}
