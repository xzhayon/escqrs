import { Effect, pipe } from '@effect-ts/core'
import { $Layer } from '../config/Layer.testing'
import { $MutableEntity } from './MutableEntity'

describe('MutableEntity', () => {
  it('creating a mutable entity', async () => {
    const created = new Date()

    await expect(
      pipe(
        $MutableEntity('foo')({ mad: 'max' }, { id: 'bar', date: { created } }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual({
      _: {
        type: 'foo',
        id: 'bar',
        date: { created, updated: created },
        version: -1,
      },
      mad: 'max',
    })
  })

  describe('bumpVersion', () => {
    it('updating date and version', async () => {
      await expect(
        pipe(
          $MutableEntity('foo')({}, { version: 42 }),
          Effect.chain($MutableEntity.bump),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { version: 43 } })
    })
  })
})
