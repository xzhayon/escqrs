import { Effect, pipe } from '@effect-ts/core'
import { $Logger } from '../../Logger'
import { MessageHandler } from '../MessageHandler'
import { Event } from './Event'

const CHANNEL = 'EventHandler'

export interface EventHandler<A extends Event = Event>
  extends MessageHandler<A['_']['type']> {
  readonly name: string
  readonly handle: (event: A) => Effect.Effect<Effect.DefaultEnv, Error, void>
}

export function $EventHandler<A extends Event>(
  messageType: A['_']['type'],
  name: string,
) {
  return <R>(
    handle: Effect.RIO<R, EventHandler<A>['handle']>,
  ): Effect.RIO<R, EventHandler> =>
    pipe(
      handle,
      Effect.map((_handle) => ({
        messageType,
        name,
        handle: _handle as EventHandler['handle'],
      })),
    )
}

$EventHandler.handle = (event: Event) => (handler: EventHandler) =>
  event._.type !== handler.messageType
    ? Effect.unit
    : pipe(
        event,
        handler.handle,
        Effect.tapBoth(
          (error) =>
            $Logger.error('Event not handled', {
              messageType: event._.type,
              handlerName: handler.name,
              error,
              correlationId: event._.correlationId,
              aggregateId: event.aggregateId,
              messageId: event._.id,
              causationId: event._.causationId,
              channel: CHANNEL,
            }),
          () =>
            $Logger.debug('Event handled', {
              messageType: event._.type,
              handlerName: handler.name,
              correlationId: event._.correlationId,
              aggregateId: event.aggregateId,
              messageId: event._.id,
              causationId: event._.causationId,
              channel: CHANNEL,
            }),
        ),
      )
