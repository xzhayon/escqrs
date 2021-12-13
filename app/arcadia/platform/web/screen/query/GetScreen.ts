import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $Screen, $ScreenC } from '../../../../screen/Screen'

export const GetScreen = $HttpServer.get(
  '/api/v1/screens/:id',
  { params: t.type({ id: t.string }), response: t.type({ data: $ScreenC }) },
  (request) =>
    gen(function* (_) {
      const screen = yield* _($Screen.load($Screen.id(request.params.id)))

      return { data: screen }
    }),
)
