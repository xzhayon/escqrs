import { Branded, Effect, Either, NonEmptyArray, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { $Aggregate } from './Aggregate'
import { Body, Header, Id } from './entity/Entity'
import { $Event, Event } from './entity/message/event/Event'
import {
  $EventSourcedEntity,
  EventSourcedEntity,
} from './entity/message/event/EventSourcedEntity'
import { $EventStore } from './entity/message/event/eventstore/EventStore'
import { $Message } from './entity/message/Message'
import { $MutableEntity, MutableEntity } from './entity/MutableEntity'
import { EntityNotFound } from './entity/repository/EntityNotFound'
import { $Repository } from './entity/repository/Repository'
import { PartialDeep } from './PartialDeep'
import { WrongEntityVersion } from './WrongEntityVersion'

interface Foo extends EventSourcedEntity<'foo'> {
  readonly bar: number
}

const aggregate = $Aggregate<Foo, Event<Foo>>('foo', {
  foo: (entity, event) =>
    'bar' in event
      ? entity
        ? { ...entity, bar: entity.bar + ((event as any).bar ?? 0) }
        : { bar: (event as any).bar }
      : undefined,
})

const event = (
  aggregateId: Event['aggregateId'],
  body?: object,
  header?: PartialDeep<Header<Event>>,
): Event =>
  Branded.makeBranded({
    _: {
      type: 'type',
      id: $Message.id('id'),
      date: new Date(),
      correlationId: $Message.id('correlationId'),
      causationId: $Message.id('causationId'),
      ...header,
    },
    aggregateId,
    ...body,
  })

const entity = (
  id: Id<EventSourcedEntity>,
  header?: PartialDeep<Header<EventSourcedEntity>>,
): Foo => ({
  _: {
    ...header,
    type: 'foo',
    id,
    date: { created: new Date(), updated: new Date(), ...header?.date },
    version: -1,
    events: { uncommitted: [] },
  },
  bar: 0,
})

describe('Aggregate', () => {
  describe('load', () => {
    test('failing when there is no entity', async () => {
      await expect(
        pipe(
          aggregate.load('bar'),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)

      await expect(
        pipe(
          $Aggregate('foo').load('bar'),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)
    })
    test('failing when the events nullify the entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _($Event('foo')({ aggregateId: 'bar' })())
            yield* _($EventStore.publish(event))

            return yield* _(aggregate.load('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound.unreducibleEvents('foo', 'bar'))
    })
    test('failing when loading an entity of the wrong kind', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _(
              $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
            )
            yield* _($EventStore.publish(event))

            return yield* _($Aggregate('foo').load('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)

      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _($MutableEntity('foo')({}, { id: 'bar' }))
            yield* _($Repository.insert(entity))

            return yield* _(aggregate.load('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)
    })
    test('loading from event store', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _(
              $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
            )
            yield* _($EventStore.publish(event))

            return yield* _(aggregate.load('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { type: 'foo', id: 'bar' }, bar: 42 })
    })
    test('loading from repository', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _(
              $MutableEntity('foo')({ bar: 42 }, { id: 'bar' }),
            )
            yield* _($Repository.insert(entity))

            return yield* _($Aggregate('foo').load('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { type: 'foo', id: 'bar' }, bar: 42 })
    })
  })

  describe('apply', () => {
    test('applying an event to a new entity', () => {
      const _event = event('foo', { bar: 42 })

      expect(aggregate.apply(_event)()).toStrictEqual(
        Either.right({
          _: {
            type: 'foo',
            id: 'foo',
            date: { created: _event._.date, updated: _event._.date },
            version: -1,
            events: { uncommitted: [_event] },
          },
        }),
      )
    })
    test('applying an event to an existing entity', () => {
      const _event = event('bar', { bar: 42 })
      const _entity = entity('bar')

      expect(aggregate.apply(_event)(_entity)).toStrictEqual(
        Either.right({
          _: {
            ..._entity._,
            date: { ..._entity._.date, updated: _event._.date },
            events: { uncommitted: [_event] },
          },
        }),
      )
    })
    test('applying an event that nullifies the entity', () => {
      const _event = event('bar')
      const _entity = entity('bar')

      expect(aggregate.apply(_event)(_entity)).toStrictEqual(
        Either.right({
          _: {
            ..._entity._,
            date: { ..._entity._.date, updated: _event._.date },
            events: { uncommitted: [_event] },
          },
        }),
      )
    })
    test('applying an event of another entity to an existing one', () => {
      const _event = event('foo')
      const _entity = entity('bar')

      expect(aggregate.apply(_event)(_entity)).toStrictEqual(
        Either.right({ _: _entity._ }),
      )
    })
  })

  describe('save', () => {
    test('saving to event store', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _($Event('foo')({ aggregateId: 'bar' })())
            const entity = yield* _(
              $EventSourcedEntity<Foo>('foo')(
                { bar: 42 },
                { id: 'bar', events: { uncommitted: [event] } },
              ),
            )
            yield* _(aggregate.save(entity))

            return yield* _($EventStore.events('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toHaveLength(1)
    })
    test('saving to repository', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _($MutableEntity('foo')({}, { id: 'bar' }))
            yield* _($Aggregate('foo').save(entity))

            return NonEmptyArray.head(yield* _($Repository.find(entity)))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { id: 'bar' } })
    })
  })

  test('saving a stale entity', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const event = yield* _(
            $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
          )
          yield* _($EventStore.publish(event))
          yield* _($EventStore.publish(event))
          const entity = yield* _(aggregate.load('bar'))
          yield* _($EventStore.publish(event))

          return yield* _(aggregate.save(entity))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).rejects.toThrow(WrongEntityVersion)

    await expect(
      pipe(
        gen(function* (_) {
          const entity = yield* _($MutableEntity('foo')({}, { id: 'bar' }))
          yield* _($Aggregate('foo').save(entity))

          return yield* _($Aggregate('foo').save(entity))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).rejects.toThrow(WrongEntityVersion)
  })
  test('updating a nonexistent entity', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const entity = yield* _(
            $MutableEntity('foo')({}, { id: 'bar', version: 0 }),
          )

          return yield* _($Aggregate('foo').save(entity))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).rejects.toThrow(EntityNotFound.build('foo', 'bar'))
  })
  test('updating an entity', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const event = yield* _(
            $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
          )
          yield* _($EventStore.publish(event))
          yield* _($EventStore.publish(event))
          const entity = yield* _(aggregate.load('bar'))
          yield* _(
            aggregate.save({
              ...entity,
              _: { ...entity._, events: { uncommitted: [event] } },
            }),
          )

          return yield* _(aggregate.load('bar'))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toMatchObject({
      _: { type: 'foo', id: 'bar', version: 2 },
      bar: 42 + 42 + 42,
    })

    await expect(
      pipe(
        gen(function* (_) {
          const entity = yield* _(
            $MutableEntity('foo')({ bar: 42 }, { id: 'bar' }),
          )
          yield* _($Aggregate('foo').save(entity))
          const _entity = yield* _($Aggregate('foo').load('bar'))
          yield* _(
            $Aggregate('foo').save({ ..._entity, bar: 1138 } as MutableEntity),
          )

          return yield* _($Aggregate('foo').load('bar'))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toMatchObject({
      _: { type: 'foo', id: 'bar', version: 1 },
      bar: 1138,
    })
  })
})
