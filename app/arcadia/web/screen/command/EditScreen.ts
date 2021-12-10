import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Screen, $ScreenC } from '../../../Screen'
import { $Fastify } from '../../Fastify'

export const $EditScreen = $Fastify.patch(
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
  async (request) =>
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
