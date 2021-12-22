import {
  Effect,
  Managed,
  Option,
  pipe,
  Queue,
  Record,
  Ref,
  Stream,
} from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { HasClock } from '@effect-ts/core/Effect/Clock'
import { HasRandom } from '@effect-ts/core/Effect/Random'
import { $Logger, HasLogger } from '../../../../logger/Logger'
import { Command } from '../Command'
import { $CommandHandler, CommandHandler } from '../CommandHandler'
import { ServiceBus } from './ServiceBus'

const CHANNEL = 'QueueServiceBus'

export const $QueueServiceBus = (queue: Effect.UIO<Queue.Queue<Command>>) =>
  pipe(
    gen(function* (_) {
      const _queue = yield* _(queue)
      const handlers = yield* _(
        Ref.makeRef<Record.Dictionary<CommandHandler>>({}),
      )
      const $clock = yield* _(HasClock)
      const $logger = yield* _(HasLogger)
      const $random = yield* _(HasRandom)
      yield* _(
        $Logger.debug('Queue created', {
          queueCapacity: Queue.capacity(_queue),
          channel: CHANNEL,
        }),
      )

      const serviceBus: ServiceBus = {
        dispatch: (command) =>
          pipe(
            _queue,
            Queue.offer(command),
            Effect.ifM(
              () => Effect.unit,
              () =>
                Effect.fail(
                  Error(
                    `Cannot dispatch command "${command._.id}" of type "${command._.type}"`,
                  ),
                ),
            ),
          ),
        registerHandler: (handler) =>
          Ref.update_(handlers, Record.insertAt(handler.type, handler)),
        run: pipe(
          _queue,
          Stream.fromQueueWithShutdown,
          Stream.forEach((command) =>
            gen(function* (_) {
              const handler = Record.lookup_(
                yield* _(handlers.get),
                command._.type,
              )
              if (!Option.isSome(handler)) {
                return
              }

              yield* _($CommandHandler.handle(command)(handler.value))
            }),
          ),
          Effect.provideService(HasClock)($clock),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRandom)($random),
          Effect.fork,
        ),
      }

      return { serviceBus, _queue, _handlers: handlers }
    }),
    Managed.make(({ _queue, _handlers }) =>
      gen(function* (_) {
        const queueSize = yield* _(Queue.size(_queue))
        yield* _(Queue.shutdown(_queue))
        yield* _(Ref.set_(_handlers, {}))
        yield* _(
          $Logger.debug('Queue shut down', {
            queueCapacity: Queue.capacity(_queue),
            queueSize,
            channel: CHANNEL,
          }),
        )
      }),
    ),
    Managed.map(({ serviceBus }) => serviceBus),
  )
