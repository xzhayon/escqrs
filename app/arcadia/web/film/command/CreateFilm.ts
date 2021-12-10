import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Film, $FilmC } from '../../../Film'
import { $Fastify } from '../../Fastify'

export const $CreateFilm = $Fastify.post(
  '/api/v1/films',
  { body: t.type({ data: $FilmC }), response: t.type({ data: $FilmC }) },
  async (request) =>
    gen(function* (_) {
      yield* _($Film.save(request.body.data))

      return { data: yield* _($Film.load(request.body.data._.id)) }
    }),
)
