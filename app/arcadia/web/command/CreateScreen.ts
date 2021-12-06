import { gen } from '@effect-ts/system/Effect'
import { FastifyPluginAsync } from 'fastify'
import * as t from 'io-ts'
import { $Any } from '../../../../src/Any'
import { $Screen, $ScreenC } from '../../Screen'

export const $CreateScreen: FastifyPluginAsync = async (instance, opts) => {
  instance.post('/api/v1/screens', { schema: {} }, async (request, _reply) =>
    gen(function* (_) {
      const body = yield* _(
        $Any.decode(t.type({ data: $ScreenC }))(request.body),
      )
      yield* _($Screen.save(body.data))

      return { data: yield* _($Screen.load(body.data._.id)) }
    }),
  )
}
