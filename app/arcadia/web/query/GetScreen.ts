import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Screen, $ScreenC } from '../../Screen'
import { $Fastify } from '../Fastify'

export const $GetScreen = $Fastify.get(
  '/api/v1/screens/:id',
  { params: t.type({ id: t.string }), response: t.type({ data: $ScreenC }) },
  async (request) =>
    gen(function* (_) {
      const screen = yield* _($Screen.load($Screen.id(request.params.id)))

      return { data: screen }
    }),
)
