import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $Screen, $ScreenC } from '../../../Screen'

export const $EditScreen = $HttpServer.patch(
  '/api/v1/screens/:id',
  {
    body: t.type({
      data: t.exact(
        t.partial({
          name: t.string,
          seats: t.partial({ rows: t.number, columns: t.number }),
        }),
      ),
    }),
    params: t.type({ id: t.string }),
    response: t.type({ data: $ScreenC }),
  },
  (request) =>
    gen(function* (_) {
      const screen = yield* _($Screen.load($Screen.id(request.params.id)))
      const _screen = {
        ...screen,
        ...request.body.data,
        seats: { ...screen.seats, ...request.body.data.seats },
      }
      yield* _($Screen.save(_screen))

      return { data: yield* _($Screen.load(screen._.id)) }
    }),
)
