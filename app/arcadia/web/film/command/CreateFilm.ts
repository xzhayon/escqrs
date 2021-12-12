import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $Film, $FilmC } from '../../../film/Film'

export const $CreateFilm = $HttpServer.post(
  '/api/v1/films',
  {
    body: t.type({
      data: t.strict({ _: t.strict({ id: t.string }), title: t.string }),
    }),
    response: t.type({ data: $FilmC }),
  },
  (request) =>
    gen(function* (_) {
      const film = yield* _(
        $Film()(request.body.data, { id: $Film.id(request.body.data._.id) }),
      )
      yield* _($Film.save(film))

      return { data: yield* _($Film.load(film._.id)) }
    }),
)
