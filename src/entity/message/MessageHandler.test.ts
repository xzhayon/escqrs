import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../../../config/Layer.testing'
import { $Message } from './Message'
import { $MessageHandler } from './MessageHandler'

describe('MessageHandler', () => {
  describe('handle', () => {
    let bar: number
    const handler = $MessageHandler('foo')(() =>
      Effect.succeedWith(() => {
        bar++
      }),
    )

    beforeEach(() => {
      bar = 0
    })

    test('handling a message', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const message = yield* _($Message('foo')({ aggregateId: 'bar' })())

            return yield* _($MessageHandler.handle(message)(handler))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ).then(() => bar),
      ).resolves.toBe(1)
    })
    test('ignoring messages of the wrong type', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const fooMessage = yield* _(
              $Message('foo')({ aggregateId: 'bar' })(),
            )
            const barMessage = yield* _(
              $Message('bar')({ aggregateId: 'bar' })(),
            )
            yield* _($MessageHandler.handle(fooMessage)(handler))
            yield* _($MessageHandler.handle(barMessage)(handler))
            yield* _($MessageHandler.handle(fooMessage)(handler))
            yield* _($MessageHandler.handle(barMessage)(handler))
            yield* _($MessageHandler.handle(fooMessage)(handler))

            return bar
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toBe(3)
    })
  })
})
