import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Film, $FilmC } from '../../../Film'
import { $Fastify } from '../../Fastify'

export const $GetFilm = $Fastify.get(
  '/api/v1/films/:id',
  { params: t.type({ id: t.string }), response: t.type({ data: $FilmC }) },
  async (request) =>
    gen(function* (_) {
      const film = yield* _($Film.load($Film.id(request.params.id)))

      return { data: film }
    }),
)
