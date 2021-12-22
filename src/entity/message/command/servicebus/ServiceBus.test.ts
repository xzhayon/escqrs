import { Effect, pipe, Queue } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import { $Layer } from '../../../../../config/Layer.testing'
import { HasLogger } from '../../../../logger/Logger'
import { $NilLogger } from '../../../../logger/NilLogger'
import { Body } from '../../../Entity'
import { $Command, Command } from '../Command'
import { $CommandHandler } from '../CommandHandler'
import { $InMemoryServiceBus } from './InMemoryServiceBus'
import { $QueueServiceBus } from './QueueServiceBus'
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
    [
      'QueueServiceBus',
      () =>
        pipe(
          $Layer,
          Layer.and(
            Layer.fromManaged(HasServiceBus)(
              $QueueServiceBus(Queue.makeUnbounded()),
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

    test('handling a command', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const handler = $CommandHandler('foo')((command) =>
              Effect.succeedWith(() => {
                bar += (command as any).bar
              }),
            )
            yield* _($ServiceBus.registerHandler(handler))
            yield* _($ServiceBus.run)
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
    test('registering multiple handlers for the same command', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const handlers = [
              $CommandHandler('foo')((command) =>
                Effect.succeedWith(() => {
                  bar += (command as any).bar
                }),
              ),
              $CommandHandler('foo')((command) =>
                Effect.succeedWith(() => {
                  bar -= 2 * (command as any).bar
                }),
              ),
            ]
            for (const handler of handlers) {
              yield* _($ServiceBus.registerHandler(handler))
            }
            yield* _($ServiceBus.run)
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
