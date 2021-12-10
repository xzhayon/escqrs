import { Array, Effect, Function, Managed, pipe, Ref } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import EventEmitter from 'events'
import { $Error } from '../../../../Error'
import { $Logger, HasLogger } from '../../../../logger/Logger'
import { Event } from '../Event'
import { $EventHandler, EventHandler } from '../EventHandler'
import { EventStore } from './EventStore'

const CHANNEL = 'InMemoryEventStore'

const getEvents = (events: Ref.Ref<Array.Array<Event>>) => events.get

export const $InMemoryEventStore = (emitter: Function.Lazy<EventEmitter>) =>
  pipe(
    Effect.tryCatch(
      emitter,
      $Error.fromUnknown(Error('Cannot create event emitter instance')),
    ),
    Effect.chain((_emitter) =>
      gen(function* (_) {
        const handlers = yield* _(Ref.makeRef(Array.emptyOf<EventHandler>()))
        const events = yield* _(Ref.makeRef(Array.emptyOf<Event>()))
        const pointer = yield* _(Ref.makeRef(0))
        const $logger = yield* _(HasLogger)

        yield* _(
          $Logger.debug('Event store created', {
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
          subscribe: (handler) =>
            pipe(handlers, Ref.update(Array.snoc(handler))),
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

        return { eventStore, _emitter, _events: events, _pointer: pointer }
      }),
    ),
    Managed.make(({ _emitter, _events, _pointer }) =>
      gen(function* (_) {
        _emitter.removeAllListeners()
        const events = yield* _(_events.get)
        yield* _(_events.set(Array.empty))
        yield* _(
          $Logger.debug('Event store destroyed', {
            eventsCount: events.length,
            pointer: yield* _(_pointer.get),
            channel: CHANNEL,
          }),
        )
      }),
    ),
    Managed.map(({ eventStore }) => eventStore),
  )
