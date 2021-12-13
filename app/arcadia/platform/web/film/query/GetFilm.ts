import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $Film, $FilmC } from '../../../../film/Film'

export const GetFilm = $HttpServer.get(
  '/api/v1/films/:id',
  { params: t.type({ id: t.string }), response: t.type({ data: $FilmC }) },
  (request) =>
    gen(function* (_) {
      const film = yield* _($Film.load($Film.id(request.params.id)))

      return { data: film }
    }),
)
