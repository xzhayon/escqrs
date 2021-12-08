import { Array, Effect, Has, pipe } from '@effect-ts/core'
import { $Logger } from '../../../../logger/Logger'
import { Id } from '../../../Entity'
import { Event } from '../Event'
import { EventHandler } from '../EventHandler'
import { EventSourcedEntity } from '../EventSourcedEntity'

const CHANNEL = 'EventStore'

export interface EventStore {
  readonly publish: (event: Event) => Effect.IO<Error, void>
  readonly subscribe: (handler: EventHandler) => Effect.IO<Error, void>
  readonly events: <A extends EventSourcedEntity>(
    aggregateId: Id<A>,
  ) => Effect.IO<Error, Array.Array<Event>>
  readonly run: Effect.IO<Error, void>
}

export const HasEventStore = Has.tag<EventStore>()

const {
  publish: _publish,
  events: _events,
  run: _run,
} = Effect.deriveLifted(HasEventStore)(['publish', 'events'], ['run'], [])
const { subscribe: _subscribe } = Effect.deriveAccessM(HasEventStore)([
  'subscribe',
])

const publish = (event: Event) =>
  pipe(
    event,
    _publish,
    Effect.tapBoth(
      (error) =>
        $Logger.error('Event not published', {
          messageType: event._.type,
          error,
          aggregateId: event.aggregateId,
          correlationId: event._.correlationId,
          messageId: event._.id,
          causationId: event._.causationId,
          channel: CHANNEL,
        }),
      () =>
        $Logger.info('Event published', {
          messageType: event._.type,
          aggregateId: event.aggregateId,
          correlationId: event._.correlationId,
          messageId: event._.id,
          causationId: event._.causationId,
          channel: CHANNEL,
        }),
    ),
  )

const subscribe = (handler: EventHandler) =>
  pipe(
    _subscribe((f) => f(handler)),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Event handler not subscribed', {
          messageType: handler.type,
          handlerName: handler.name,
          error,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Event handler subscribed', {
          messageType: handler.type,
          handlerName: handler.name,
          channel: CHANNEL,
        }),
    ),
  )

const events = <A extends EventSourcedEntity>(aggregateId: Id<A>) =>
  pipe(
    aggregateId,
    _events,
    Effect.tapBoth(
      (error) =>
        $Logger.error('Aggregate events not fetched', {
          error,
          aggregateId,
          channel: CHANNEL,
        }),
      (events) =>
        $Logger.debug('Aggregate events fetched', {
          aggregateId,
          eventsCount: events.length,
          channel: CHANNEL,
        }),
    ),
  )

const run = pipe(
  _run,
  Effect.tapBoth(
    (error) =>
      $Logger.error('Event store not started', {
        error,
        channel: CHANNEL,
      }),
    () => $Logger.debug('Event store started', { channel: CHANNEL }),
  ),
)

export const $EventStore = { publish, subscribe, events, run }
