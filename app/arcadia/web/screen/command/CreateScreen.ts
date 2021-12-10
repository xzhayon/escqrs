import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $Screen, $ScreenC } from '../../../Screen'

export const $CreateScreen = $HttpServer.post(
  '/api/v1/screens',
  {
    body: t.type({
      data: t.strict({
        _: t.strict({ id: t.string }),
        name: t.string,
        seats: t.type({ rows: t.number, columns: t.number }),
      }),
    }),
    response: t.type({ data: $ScreenC }),
  },
  (request) =>
    gen(function* (_) {
      const screen = yield* _(
        $Screen()(request.body.data, {
          id: $Screen.id(request.body.data._.id),
        }),
      )
      yield* _($Screen.save(screen))

      return { data: yield* _($Screen.load(screen._.id)) }
    }),
)
