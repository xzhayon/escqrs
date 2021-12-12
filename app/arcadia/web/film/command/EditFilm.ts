import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $Film, $FilmC } from '../../../film/Film'

export const $EditFilm = $HttpServer.patch(
  '/api/v1/films/:id',
  {
    body: t.type({ data: t.exact(t.partial({ title: t.string })) }),
    params: t.type({ id: t.string }),
    response: t.type({ data: $FilmC }),
  },
  (request) =>
    gen(function* (_) {
      const film = yield* _($Film.load($Film.id(request.params.id)))
      const _film = { ...film, ...request.body.data }
      yield* _($Film.save(_film))

      return { data: yield* _($Film.load(film._.id)) }
    }),
)
