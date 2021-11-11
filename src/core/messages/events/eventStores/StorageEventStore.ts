import { Array, Effect, Function, Managed, pipe, Ref } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { flow } from '@effect-ts/system/Function'
import { HasRandom } from '@effect-ts/system/Random'
import EventEmitter from 'events'
import { join } from 'path'
import { createInterface } from 'readline'
import { $AggregateId } from '../../../aggregates/Aggregate'
import { $Error } from '../../../Error'
import { $Logger, HasLogger } from '../../../Logger'
import { $Storage, HasStorage } from '../../../Storage'
import { Event } from '../Event'
import { $EventHandler, EventHandler } from '../EventHandler'
import { EventStore } from '../EventStore'

const CHANNEL = 'StorageEventStore'

const getLocation = (
  directory: string,
  file: 'events.ndjson' | 'pointer.json',
) => join(directory, file)

const getEvents = (location: string) =>
  pipe(
    getLocation(location, 'events.ndjson'),
    $Storage.readStream,
    Effect.map((readable) => createInterface(readable)),
    Effect.chain((readable) =>
      Effect.tryCatchPromise<Error, Array.Array<Event>>(() => {
        const events: Event[] = []

        return new Promise((resolve, reject) =>
          readable
            .on('line', (event) => {
              try {
                events.push(JSON.parse(event))
              } catch (error) {
                reject(error)
              }
            })
            .on('close', () => resolve(events)),
        )
      }, $Error.fromUnknown(Error('Cannot read events'))),
    ),
  )

export const $StorageEventStore = (
  location: string,
  emitter: Function.Lazy<EventEmitter>,
  replay = false,
) =>
  pipe(
    Effect.do,
    Effect.let('_emitter', emitter),
    Effect.bindAllPar(() => ({
      handlers: Ref.makeRef(Array.emptyOf<EventHandler>()),
      writable: !replay
        ? $Storage.writeStream(getLocation(location, 'events.ndjson'), {
            append: true,
          })
        : Effect.unit,
      _pointer: !replay
        ? pipe(
            $Storage.read(getLocation(location, 'pointer.json')),
            Effect.orElse(() =>
              pipe(
                $Storage.write(getLocation(location, 'pointer.json'))(
                  Buffer.from('0'),
                ),
                Effect.map(() => 0),
              ),
            ),
          )
        : Effect.succeed(0),
    })),
    Effect.bind('pointer', ({ _pointer }) =>
      Ref.makeRef(Number(_pointer.toString())),
    ),
    Effect.bindAllPar(({ pointer }) => ({
      __pointer: pointer.get,
    })),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Connection to storage event store failed', {
          storagePath: location,
          error,
          channel: CHANNEL,
        }),
      ({ __pointer }) =>
        $Logger.debug('Connection to storage event store opened', {
          storagePath: location,
          pointer: __pointer,
          channel: CHANNEL,
        }),
    ),
    Effect.bindAllPar(() => ({
      $clock: Effect.service(HasClock),
      $logger: Effect.service(HasLogger),
      $random: Effect.service(HasRandom),
      $storage: Effect.service(HasStorage),
    })),
    Effect.map(
      ({
        _emitter,
        handlers,
        writable,
        pointer,
        $clock,
        $logger,
        $random,
        $storage,
      }) => {
        const handle = (event: Event) =>
          pipe(
            handlers.get,
            Effect.chain(Array.mapEffectPar($EventHandler.handle(event))),
            Effect.tap(() =>
              pipe(
                pointer,
                Ref.update((n) => n + 1),
              ),
            ),
            Effect.chain(() =>
              !replay
                ? pipe(
                    pointer.get,
                    Effect.map((n) => Buffer.from(n.toString())),
                    Effect.chain(
                      $Storage.write(getLocation(location, 'pointer.json')),
                    ),
                  )
                : Effect.unit,
            ),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          )

        const publish = (event: Event) =>
          pipe(
            Effect.tryCatch(() => {
              if (
                undefined !== writable &&
                !writable.write(`${JSON.stringify(event)}\n`)
              ) {
                throw undefined
              }
            }, $Error.fromUnknown(Error(`Cannot write to stream of file "${getLocation(location, 'events.ndjson')}"`))),
            Effect.tap(() =>
              Effect.succeedWith(() => _emitter.emit('event', event)),
            ),
          )

        const eventStore: EventStore = {
          publish,
          subscribe: (handler) =>
            pipe(handlers, Ref.update(Array.snoc(handler))),
          eventsByAggregateId: (aggregateId) =>
            pipe(
              Effect.do,
              Effect.bindAllPar(() => ({
                events: getEvents(location),
                _pointer: pointer.get,
              })),
              Effect.map(({ events, _pointer }) =>
                pipe(
                  events,
                  replay ? Array.takeLeft(_pointer + 1) : Function.identity,
                ),
              ),
              Effect.map(
                Array.filter(
                  (event) =>
                    aggregateId === event.aggregateId ||
                    aggregateId === $AggregateId(event._.correlationId),
                ),
              ),
              Effect.provideService(HasClock)($clock),
              Effect.provideService(HasLogger)($logger),
              Effect.provideService(HasStorage)($storage),
            ),
          run: pipe(
            Effect.succeedWith(() =>
              _emitter.on('event', (event: Event) =>
                pipe(event, handle, Effect.run),
              ),
            ),
            Effect.tap(() =>
              $Logger.debug('Event replay started', { channel: CHANNEL }),
            ),
            Effect.bindAllPar(() => ({
              events: getEvents(location),
              _pointer: pointer.get,
            })),
            Effect.map(({ events, _pointer }) =>
              pipe(events, Array.dropLeft(_pointer)),
            ),
            Effect.tap(
              Array.mapEffect((event) =>
                pipe(
                  event,
                  handle,
                  Effect.tapBoth(
                    (error) =>
                      $Logger.error('Event not replayed', {
                        messageType: event._.type,
                        error,
                        correlationId: event._.correlationId,
                        aggregateId: event.aggregateId,
                        messageId: event._.id,
                        causationId: event._.causationId,
                        channel: CHANNEL,
                      }),
                    () =>
                      $Logger.info('Event replayed', {
                        messageType: event._.type,
                        correlationId: event._.correlationId,
                        aggregateId: event.aggregateId,
                        messageId: event._.id,
                        causationId: event._.causationId,
                        channel: CHANNEL,
                      }),
                  ),
                ),
              ),
            ),
            Effect.tapBoth(
              (error) =>
                $Logger.error('Event replay failed', {
                  error,
                  channel: CHANNEL,
                }),
              () =>
                $Logger.debug('Event replay completed', { channel: CHANNEL }),
            ),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasRandom)($random),
            Effect.provideService(HasStorage)($storage),
          ),
        }

        return { ...eventStore, pointer }
      },
    ),
    Managed.make(
      flow(
        Effect.succeed,
        Effect.bindAllPar(({ pointer }) => ({ _pointer: pointer.get })),
        Effect.tap(({ _pointer }) =>
          $Logger.debug('Connection to storage event store closed', {
            storagePath: location,
            pointer: _pointer,
            channel: CHANNEL,
          }),
        ),
      ),
    ),
  )
