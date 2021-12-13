import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Repository } from '../../../../../../src/entity/repository/Repository'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $ScreenC, Screen } from '../../../../screen/Screen'

export const GetScreens = $HttpServer.get(
  '/api/v1/screens',
  { response: t.type({ data: t.readonlyArray($ScreenC) }) },
  () =>
    gen(function* (_) {
      const screens = yield* _(
        $Repository.find<Screen>({ _: { type: 'Screen' } }),
      )

      return { data: screens }
    }),
)
