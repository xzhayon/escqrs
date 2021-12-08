import { Effect, pipe } from '@effect-ts/core'
import { $Layer } from '../../config/Layer.testing'
import { $Entity } from './Entity'

describe('Entity', () => {
  test('creating an entity', async () => {
    await expect(
      pipe(
        $Entity('foo')({ mad: 'max' }, { id: 'bar' }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual({ _: { type: 'foo', id: 'bar' }, mad: 'max' })
  })
})
