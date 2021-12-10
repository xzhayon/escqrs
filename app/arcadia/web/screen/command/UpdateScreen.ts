import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Screen, $ScreenC } from '../../../Screen'
import { $Fastify } from '../../Fastify'

export const $UpdateScreen = $Fastify.patch(
  '/api/v1/screens/:id',
  {
    body: t.type({ data: $ScreenC }),
    params: t.type({ id: t.string }),
    response: t.type({ data: $ScreenC }),
  },
  async (request) =>
    gen(function* (_) {
      yield* _($Screen.save(request.body.data))

      return { data: yield* _($Screen.load($Screen.id(request.params.id))) }
    }),
)
