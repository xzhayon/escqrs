import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { $Message } from './Message'
import { $MessageHandler } from './MessageHandler'

describe('MessageHandler', () => {
  describe('handle', () => {
    let bar: number
    const handler = $MessageHandler('foo')(
      Effect.succeed(() =>
        Effect.succeedWith(() => {
          bar++
        }),
      ),
    )

    beforeEach(() => {
      bar = 0
    })

    it('handling a message', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const message = yield* _($Message('foo')({ aggregateId: 'bar' })())

            return yield* _($MessageHandler.handle(message)(yield* _(handler)))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ).then(() => bar),
      ).resolves.toBe(1)
    })
    it('ignoring messages of the wrong type', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const fooMessage = yield* _(
              $Message('foo')({ aggregateId: 'bar' })(),
            )
            const barMessage = yield* _(
              $Message('bar')({ aggregateId: 'bar' })(),
            )
            yield* _($MessageHandler.handle(fooMessage)(yield* _(handler)))
            yield* _($MessageHandler.handle(barMessage)(yield* _(handler)))
            yield* _($MessageHandler.handle(fooMessage)(yield* _(handler)))
            yield* _($MessageHandler.handle(barMessage)(yield* _(handler)))
            yield* _($MessageHandler.handle(fooMessage)(yield* _(handler)))

            return bar
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toBe(3)
    })
  })
})
