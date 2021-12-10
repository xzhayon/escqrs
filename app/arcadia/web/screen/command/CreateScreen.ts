import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Screen, $ScreenC } from '../../../Screen'
import { $Fastify } from '../../Fastify'

export const $CreateScreen = $Fastify.post(
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
  async (request) =>
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
