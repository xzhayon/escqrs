import { Effect, pipe } from '@effect-ts/core'
import { $Logger } from '../../logger/Logger'
import { Type } from '../Entity'
import { Message } from './Message'

const CHANNEL = 'MessageHandler'

export interface MessageHandler<R = unknown, A extends Message = Message> {
  readonly type: Type<A>
  readonly handle: (
    message: A,
  ) => Effect.Effect<R & Effect.DefaultEnv, Error, void>
}

export function $MessageHandler<A extends Message>(type: Type<A>) {
  return <R>(handle: MessageHandler<R, A>['handle']): MessageHandler<R> => ({
    type,
    handle: handle as MessageHandler<R>['handle'],
  })
}

$MessageHandler.handle = (message: Message) => (handler: MessageHandler) =>
  message._.type !== handler.type
    ? Effect.unit
    : pipe(
        message,
        handler.handle,
        Effect.tapBoth(
          (error) =>
            $Logger.error('Message not handled', {
              messageType: message._.type,
              error,
              aggregateId: message.aggregateId,
              correlationId: message._.correlationId,
              messageId: message._.id,
              causationId: message._.causationId,
              channel: CHANNEL,
            }),
          () =>
            $Logger.debug('Message handled', {
              messageType: message._.type,
              aggregateId: message.aggregateId,
              correlationId: message._.correlationId,
              messageId: message._.id,
              causationId: message._.causationId,
              channel: CHANNEL,
            }),
        ),
      )
