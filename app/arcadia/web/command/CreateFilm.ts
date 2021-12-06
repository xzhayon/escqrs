import { gen } from '@effect-ts/system/Effect'
import { FastifyPluginAsync } from 'fastify'
import * as t from 'io-ts'
import { $Any } from '../../../../src/Any'
import { $Film, $FilmC } from '../../Film'

export const $CreateFilm: FastifyPluginAsync = async (instance, opts) => {
  instance.post('/api/v1/films', async (request, _reply) =>
    gen(function* (_) {
      const body = yield* _($Any.decode(t.type({ data: $FilmC }))(request.body))
      yield* _($Film.save(body.data))

      return { data: yield* _($Film.load(body.data._.id)) }
    }),
  )
}
