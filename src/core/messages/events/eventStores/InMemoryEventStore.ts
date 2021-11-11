import { Array, Effect, Function, Managed, pipe, Ref } from '@effect-ts/core'
import { flow } from '@effect-ts/system/Function'
import EventEmitter from 'events'
import { $AggregateId } from '../../../aggregates/Aggregate'
import { $Logger, HasLogger } from '../../../Logger'
import { Event } from '../Event'
import { $EventHandler, EventHandler } from '../EventHandler'
import { EventStore } from '../EventStore'

const CHANNEL = 'InMemoryEventStore'

const getEvents = (events: Ref.Ref<Array.Array<Event>>) => events.get

export const $InMemoryEventStore = (emitter: Function.Lazy<EventEmitter>) =>
  pipe(
    Effect.do,
    Effect.let('_emitter', emitter),
    Effect.bindAllPar(() => ({
      handlers: Ref.makeRef(Array.emptyOf<EventHandler>()),
      events: Ref.makeRef(Array.emptyOf<Event>()),
      pointer: Ref.makeRef(0),
      $logger: Effect.service(HasLogger),
    })),
    Effect.tap(() =>
      $Logger.debug('Connection to in-memory event store opened', {
        eventsCount: 0,
        pointer: 0,
        channel: CHANNEL,
      }),
    ),
    Effect.map(({ _emitter, handlers, events, pointer, $logger }) => {
      const eventStore: EventStore = {
        publish: (event) =>
          pipe(
            events,
            Ref.update(Array.snoc(event)),
            Effect.tap(() =>
              Effect.succeedWith(() => _emitter.emit('event', event)),
            ),
          ),
        subscribe: (handler) => pipe(handlers, Ref.update(Array.snoc(handler))),
        eventsByAggregateId: (aggregateId) =>
          pipe(
            events,
            getEvents,
            Effect.map(
              Array.filter(
                (event) =>
                  aggregateId === event.aggregateId ||
                  aggregateId === $AggregateId(event._.correlationId),
              ),
            ),
          ),
        run: Effect.succeedWith(() =>
          _emitter.on('event', (event: Event) =>
            pipe(
              handlers.get,
              Effect.tap(Array.mapEffect($EventHandler.handle(event))),
              Effect.tap(() =>
                pipe(
                  pointer,
                  Ref.update((n) => n + 1),
                ),
              ),
              Effect.provideService(HasLogger)($logger),
              Effect.run,
            ),
          ),
        ),
      }

      return { ...eventStore, _events: events, pointer }
    }),
    Managed.make(
      flow(
        Effect.succeed,
        Effect.bindAllPar(({ _events, pointer }) => ({
          __events: _events.get,
          _pointer: pointer.get,
        })),
        Effect.tap(({ __events, _pointer }) =>
          $Logger.debug('Connection to in-memory event store closed', {
            eventsCount: __events.length,
            pointer: _pointer,
            channel: CHANNEL,
          }),
        ),
      ),
    ),
  )
