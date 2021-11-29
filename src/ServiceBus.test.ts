import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { $Command, Command } from './Command'
import { $CommandHandler } from './CommandHandler'
import { Body } from './Entity'
import { $ServiceBus } from './ServiceBus'

describe('ServiceBus', () => {
  let bar: number

  beforeEach(() => {
    bar = 0
  })

  it('handling a command', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const handler = yield* _(
            $CommandHandler('foo')(
              Effect.succeed((command) =>
                Effect.succeedWith(() => {
                  bar += (command as any).bar
                }),
              ),
            ),
          )
          yield* _($ServiceBus.registerHandler(handler))
          const command = yield* _(
            $Command('foo')({ aggregateId: 'bar', bar: 42 } as Body<Command>)(),
          )

          return yield* _($ServiceBus.dispatch(command))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ).then(() => bar),
    ).resolves.toBe(42)
  })
  it('registering multiple handlers for the same command', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const handlers = [
            yield* _(
              $CommandHandler('foo')(
                Effect.succeed((command) =>
                  Effect.succeedWith(() => {
                    bar += (command as any).bar
                  }),
                ),
              ),
            ),
            yield* _(
              $CommandHandler('foo')(
                Effect.succeed((command) =>
                  Effect.succeedWith(() => {
                    bar -= 2 * (command as any).bar
                  }),
                ),
              ),
            ),
          ]
          for (const handler of handlers) {
            yield* _($ServiceBus.registerHandler(handler))
          }
          const command = yield* _(
            $Command('foo')({ aggregateId: 'bar', bar: 42 } as Body<Command>)(),
          )

          return yield* _($ServiceBus.dispatch(command))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ).then(() => bar),
    ).resolves.toBe(-42 * 2)
  })
})
