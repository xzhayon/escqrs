import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $FilmC, Film } from '../../../Film'
import { $Fastify } from '../../Fastify'

export const $GetFilms = $Fastify.get(
  '/api/v1/films',
  { response: t.type({ data: t.readonlyArray($FilmC) }) },
  async () =>
    gen(function* (_) {
      const films = yield* _($Repository.find<Film>({ _: { type: 'Film' } }))

      return { data: films }
    }),
)
