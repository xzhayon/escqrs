import { Effect, pipe } from '@effect-ts/core'
import { $Logger } from '../../Logger'
import { MessageHandler } from '../MessageHandler'
import { Command } from './Command'

const CHANNEL = 'CommandHandler'

export interface CommandHandler<A extends Command = Command>
  extends MessageHandler<A['_']['type']> {
  readonly handle: (command: A) => Effect.Effect<Effect.DefaultEnv, Error, void>
}

export function $CommandHandler<A extends Command>(
  messageType: A['_']['type'],
) {
  return <R>(
    handle: Effect.RIO<R, CommandHandler<A>['handle']>,
  ): Effect.RIO<R, CommandHandler> =>
    pipe(
      handle,
      Effect.map((_handle) => ({
        messageType,
        handle: _handle as CommandHandler['handle'],
      })),
    )
}

$CommandHandler.handle = (command: Command) => (handler: CommandHandler) =>
  command._.type !== handler.messageType
    ? Effect.unit
    : pipe(
        handler.handle(command),
        Effect.tapBoth(
          (error) =>
            $Logger.error('Command not handled', {
              messageType: command._.type,
              error,
              correlationId: command._.correlationId,
              aggregateId: command.aggregateId,
              messageId: command._.id,
              causationId: command._.causationId,
              channel: CHANNEL,
            }),
          () =>
            $Logger.debug('Command handled', {
              messageType: command._.type,
              correlationId: command._.correlationId,
              aggregateId: command.aggregateId,
              messageId: command._.id,
              causationId: command._.causationId,
              channel: CHANNEL,
            }),
        ),
      )
