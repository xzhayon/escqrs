import { Effect, Function, Managed, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import EventEmitter from 'events'
import { Command } from './Command'
import { $CommandHandler } from './CommandHandler'
import { $Logger, HasLogger } from './Logger'
import { ServiceBus } from './ServiceBus'

const CHANNEL = 'InMemoryServiceBus'

export const $InMemoryServiceBus = (emitter: Function.Lazy<EventEmitter>) =>
  pipe(
    gen(function* (_) {
      const _emitter = emitter()
      const $logger = yield* _(HasLogger)

      yield* _(
        $Logger.debug('Connection to in-memory service bus opened', {
          channel: CHANNEL,
        }),
      )

      const serviceBus: ServiceBus = {
        dispatch: (command) =>
          Effect.succeedWith(() => _emitter.emit(command._.type, command)),
        registerHandler: (handler) =>
          Effect.succeedWith(() =>
            _emitter
              .removeAllListeners(handler.type)
              .on(handler.type, (command: Command) =>
                pipe(
                  handler,
                  $CommandHandler.handle(command),
                  Effect.provideService(HasLogger)($logger),
                  Effect.run,
                ),
              ),
          ),
      }

      return serviceBus
    }),
    Managed.make(() =>
      $Logger.debug('Connection to in-memory service bus closed', {
        channel: CHANNEL,
      }),
    ),
  )
