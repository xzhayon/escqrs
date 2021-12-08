import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import { $Layer } from '../config/Layer.testing'
import { $Command, Command } from './Command'
import { $CommandHandler } from './CommandHandler'
import { Body } from './Entity'
import { $InMemoryServiceBus } from './InMemoryServiceBus'
import { HasLogger } from './Logger'
import { $NilLogger } from './NilLogger'
import { $ServiceBus, HasServiceBus } from './ServiceBus'

describe('ServiceBus', () => {
  describe.each([
    [
      'InMemoryServiceBus',
      () =>
        pipe(
          $Layer,
          Layer.and(
            Layer.fromManaged(HasServiceBus)(
              $InMemoryServiceBus(() => new EventEmitter()),
            ),
          ),
          Layer.using(Layer.fromValue(HasLogger)($NilLogger)),
          Layer.main,
        ),
    ],
  ])('%s', (_, layer) => {
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
              $Command('foo')({
                aggregateId: 'bar',
                bar: 42,
              } as Body<Command>)(),
            )

            return yield* _($ServiceBus.dispatch(command))
          }),
          Effect.provideSomeLayer(layer()),
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
              $Command('foo')({
                aggregateId: 'bar',
                bar: 42,
              } as Body<Command>)(),
            )

            return yield* _($ServiceBus.dispatch(command))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ).then(() => bar),
      ).resolves.toBe(-42 * 2)
    })
  })
})
