import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $ScreenC, Screen } from '../../../Screen'
import { $Fastify } from '../../Fastify'

export const $GetScreens = $Fastify.get(
  '/api/v1/screens',
  { response: t.type({ data: t.readonlyArray($ScreenC) }) },
  async () =>
    gen(function* (_) {
      const screens = yield* _(
        $Repository.find<Screen>({ _: { type: 'Screen' } }),
      )

      return { data: screens }
    }),
)
