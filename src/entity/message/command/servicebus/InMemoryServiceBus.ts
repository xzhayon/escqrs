import { Effect, Function, Managed, pipe, Record, Ref } from '@effect-ts/core'
import * as Dictionary from '@effect-ts/core/Collections/Immutable/Dictionary'
import { gen } from '@effect-ts/system/Effect'
import EventEmitter from 'events'
import { $Error } from '../../../../Error'
import { $Logger, HasLogger } from '../../../../logger/Logger'
import { Command } from '../Command'
import { $CommandHandler, CommandHandler } from '../CommandHandler'
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
        const handlers = yield* _(
          Ref.makeRef<Record.Dictionary<CommandHandler>>(Dictionary.empty),
        )
        const $logger = yield* _(HasLogger)

        yield* _($Logger.debug('Service bus created', { channel: CHANNEL }))

        const serviceBus: ServiceBus = {
          dispatch: (command) =>
            Effect.succeedWith(() => _emitter.emit('command', command)),
          registerHandler: (handler) =>
            pipe(
              handlers,
              Ref.update(Dictionary.insertAt(handler.type, handler)),
            ),
          run: Effect.succeedWith(() =>
            _emitter.on('command', (command: Command) =>
              pipe(
                gen(function* (_) {
                  const _handlers = yield* _(handlers.get)
                  const handler = yield* _(
                    Dictionary.lookup(command._.type)(_handlers),
                  )
                  yield* _($CommandHandler.handle(command)(handler))
                }),
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
