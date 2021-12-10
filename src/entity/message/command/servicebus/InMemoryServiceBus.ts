import { Effect, Function, Managed, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import EventEmitter from 'events'
import { $Error } from '../../../../Error'
import { $Logger, HasLogger } from '../../../../logger/Logger'
import { Command } from '../Command'
import { $CommandHandler } from '../CommandHandler'
import { ServiceBus } from './ServiceBus'

const CHANNEL = 'InMemoryServiceBus'

export const $InMemoryServiceBus = (emitter: Function.Lazy<EventEmitter>) =>
  pipe(
    Effect.tryCatch(
      emitter,
      $Error.fromUnknown(Error('Cannot create event emitter instance')),
    ),
    Effect.chain((_emitter) =>
      gen(function* (_) {
        const $logger = yield* _(HasLogger)

        yield* _($Logger.debug('Service bus created', { channel: CHANNEL }))

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

        return { serviceBus, _emitter }
      }),
    ),
    Managed.make(({ _emitter }) =>
      gen(function* (_) {
        _emitter.removeAllListeners()
        yield* _(
          $Logger.debug('Service bus destroyed', {
            channel: CHANNEL,
          }),
        )
      }),
    ),
    Managed.map(({ serviceBus }) => serviceBus),
  )
