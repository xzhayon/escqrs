import { Effect, pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/core/Effect/Layer'
import { $Layer } from '../../config/Layer.testing'
import { $Rfc4122Uuid } from './Rfc4122Uuid'
import { $Uuid, HasUuid } from './Uuid'

describe('Uuid', () => {
  describe.each([
    [
      'Rfc4122Uuid',
      () =>
        pipe(
          $Layer,
          Layer.and(Layer.fromValue(HasUuid)($Rfc4122Uuid)),
          Layer.main,
        ),
    ],
  ])('%s', (_, layer) => {
    describe('v4', () => {
      test('generating version 4 UUID', async () => {
        await expect(
          pipe($Uuid.v4, Effect.provideSomeLayer(layer()), Effect.runPromise),
        ).resolves.toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        )
      })
    })
  })
})
