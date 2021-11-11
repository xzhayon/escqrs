import { Effect, Function, Managed, pipe } from '@effect-ts/core'
import EventEmitter from 'events'
import { $Logger, HasLogger } from '../../../Logger'
import { Command } from '../Command'
import { $CommandHandler, CommandHandler } from '../CommandHandler'
import { ServiceBus } from '../ServiceBus'

const CHANNEL = 'InMemoryServiceBus'

export const $InMemoryServiceBus = (emitter: Function.Lazy<EventEmitter>) =>
  pipe(
    Effect.do,
    Effect.let('_emitter', emitter),
    Effect.tap(() =>
      $Logger.debug('Connection to in-memory service bus opened', {
        channel: CHANNEL,
      }),
    ),
    Effect.bindAllPar(() => ({ $logger: Effect.service(HasLogger) })),
    Effect.map(
      ({ _emitter, $logger }): ServiceBus => ({
        dispatch: (command) =>
          Effect.succeedWith(() => _emitter.emit(command._.type, command)),
        registerHandler: (handler) =>
          Effect.succeedWith(() =>
            _emitter
              .removeAllListeners(handler.messageType)
              .on(handler.messageType, (command: Command) =>
                pipe(
                  handler,
                  $CommandHandler.handle(command),
                  Effect.provideService(HasLogger)($logger),
                  Effect.run,
                ),
              ),
          ),
      }),
    ),
    Managed.make(() =>
      $Logger.debug('Connection to in-memory service bus closed', {
        channel: CHANNEL,
      }),
    ),
  )
