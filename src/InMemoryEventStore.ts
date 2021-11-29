import { Array, Effect, Function, Managed, pipe, Ref } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import EventEmitter from 'events'
import { Event } from './Event'
import { $EventHandler, EventHandler } from './EventHandler'
import { EventStore } from './EventStore'
import { $Logger, HasLogger } from './Logger'

const CHANNEL = 'InMemoryEventStore'

const getEvents = (events: Ref.Ref<Array.Array<Event>>) => events.get

export const $InMemoryEventStore = (emitter: Function.Lazy<EventEmitter>) =>
  pipe(
    gen(function* (_) {
      const _emitter = emitter()
      const handlers = yield* _(Ref.makeRef(Array.emptyOf<EventHandler>()))
      const events = yield* _(Ref.makeRef(Array.emptyOf<Event>()))
      const pointer = yield* _(Ref.makeRef(0))
      const $logger = yield* _(HasLogger)

      yield* _(
        $Logger.debug('Connection to in-memory event store opened', {
          eventsCount: 0,
          pointer: 0,
          channel: CHANNEL,
        }),
      )

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
        events: (aggregateId) =>
          pipe(
            events,
            getEvents,
            Effect.map(
              Array.filter(
                (event) =>
                  aggregateId === event.aggregateId ||
                  aggregateId === event._.correlationId,
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
    Managed.make(({ _events, pointer }) =>
      gen(function* (_) {
        yield* _(
          $Logger.debug('Connection to in-memory event store closed', {
            eventsCount: (yield* _(_events.get)).length,
            pointer: yield* _(pointer.get),
            channel: CHANNEL,
          }),
        )
      }),
    ),
    Managed.map(({ _events, pointer, ...eventStore }) => eventStore),
  )
