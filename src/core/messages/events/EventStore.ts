import { Array, Effect, Has, pipe } from '@effect-ts/core'
import { AggregateId } from '../../aggregates/Aggregate'
import { $Logger } from '../../Logger'
import { Event } from './Event'
import { EventHandler } from './EventHandler'

const CHANNEL = 'EventStore'

export interface EventStore {
  readonly publish: (event: Event) => Effect.IO<Error, void>
  readonly subscribe: (handler: EventHandler) => Effect.IO<Error, void>
  readonly eventsByAggregateId: (
    aggregateId: AggregateId,
  ) => Effect.IO<Error, Array.Array<Event>>
  readonly run: Effect.IO<Error, void>
}

export const HasEventStore = Has.tag<EventStore>()

const {
  publish: _publish,
  eventsByAggregateId: _eventsByAggregateId,
  run: _run,
} = Effect.deriveLifted(HasEventStore)(
  ['publish', 'eventsByAggregateId'],
  ['run'],
  [],
)
const { subscribe: _subscribe } = Effect.deriveAccessM(HasEventStore)([
  'subscribe',
])

const publish = (version: number) => (event: Event) =>
  pipe(
    event.aggregateId,
    $EventStore.eventsByAggregateId,
    Effect.chain((events) =>
      version !== events.length
        ? Effect.fail(
            Error(
              `Cannot save aggregate root "${event.aggregateId}" with version "${version}", version "${events.length}" expected`,
            ),
          )
        : Effect.succeed(event),
    ),
    Effect.chain(_publish),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Event not published', {
          messageType: event._.type,
          error,
          correlationId: event._.correlationId,
          aggregateId: event.aggregateId,
          messageId: event._.id,
          causationId: event._.causationId,
          channel: CHANNEL,
        }),
      () =>
        $Logger.info('Event published', {
          messageType: event._.type,
          correlationId: event._.correlationId,
          aggregateId: event.aggregateId,
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
          messageType: handler.messageType,
          handlerName: handler.name,
          error,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Event handler subscribed', {
          messageType: handler.messageType,
          handlerName: handler.name,
          channel: CHANNEL,
        }),
    ),
  )

const eventsByAggregateId = (aggregateId: AggregateId) =>
  pipe(
    aggregateId,
    _eventsByAggregateId,
    Effect.tapBoth(
      (error) =>
        $Logger.error('Aggregate root events not fetched', {
          error,
          aggregateId,
          channel: CHANNEL,
        }),
      (events) =>
        $Logger.debug('Aggregate root events fetched', {
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

export const $EventStore = { publish, subscribe, eventsByAggregateId, run }
