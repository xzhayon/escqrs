import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Screen, $ScreenC } from '../../../Screen'
import { $Fastify } from '../../Fastify'

export const $CreateScreen = $Fastify.post(
  '/api/v1/screens',
  { body: t.type({ data: $ScreenC }), response: t.type({ data: $ScreenC }) },
  async (request) =>
    gen(function* (_) {
      yield* _($Screen.save(request.body.data))

      return { data: yield* _($Screen.load(request.body.data._.id)) }
    }),
)
