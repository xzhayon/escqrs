import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { $Aggregate } from './Aggregate'
import { Body } from './Entity'
import { EntityNotFound } from './EntityNotFound'
import { $Event, Event } from './Event'
import { $EventSourcedEntity, EventSourcedEntity } from './EventSourcedEntity'
import { $EventStore } from './EventStore'
import { $MutableEntity } from './MutableEntity'
import { $Repository } from './Repository'
import { WrongEntityVersion } from './WrongEntityVersion'

interface Foo extends EventSourcedEntity<'foo'> {
  readonly bar: number
}

const aggregate = $Aggregate<Foo, Event>('foo', {
  foo: (entity, event) =>
    entity
      ? { ...entity, bar: entity.bar + ((event as any).bar ?? 0) }
      : { bar: (event as any).bar },
})

describe('Aggregate', () => {
  describe('loadFromEventStore', () => {
    it('failing when there are no events', async () => {
      await expect(
        pipe(
          $Aggregate.loadFromEventStore(aggregate)('bar'),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)
    })
    it('loading an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _(
              $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
            )
            yield* _($EventStore.publish(event))

            return yield* _($Aggregate.loadFromEventStore(aggregate)('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({
        _: { type: 'foo', id: 'bar', version: 0 },
        bar: 42,
      })
    })
  })

  describe('load', () => {
    it('failing when there is no entity', async () => {
      await expect(
        pipe(
          $Aggregate.load(aggregate)('bar'),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)
    })
    it('failing when loading an entity of the wrong kind', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _(
              $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
            )
            yield* _($EventStore.publish(event))

            return yield* _($Aggregate.load({ type: 'foo' })('bar'))
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

            return yield* _($Aggregate.load(aggregate)('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound)
    })
    it('loading from event store', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _(
              $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
            )
            yield* _($EventStore.publish(event))

            return yield* _($Aggregate.load(aggregate)('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { type: 'foo', id: 'bar' }, bar: 42 })
    })
    it('loading from repository', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _(
              $MutableEntity('foo')({ bar: 42 }, { id: 'bar' }),
            )
            yield* _($Repository.insert(entity))

            return yield* _($Aggregate.load({ type: 'foo' })('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { type: 'foo', id: 'bar' }, bar: 42 })
    })
  })

  describe('saveToEventStore', () => {
    it('saving a new entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _(
              $EventSourcedEntity('foo')({}, { id: 'bar' }),
            )

            return yield* _($Aggregate.saveToEventStore(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toBeUndefined()
    })
    it('saving an entity with the wrong version', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _($Event('foo')({ aggregateId: 'bar' })())
            yield* _($EventStore.publish(event))
            yield* _($EventStore.publish(event))
            const entity = yield* _(
              $EventSourcedEntity('foo')(
                {},
                { id: 'bar', version: 0, events: { uncommitted: [event] } },
              ),
            )

            return yield* _($Aggregate.saveToEventStore(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(WrongEntityVersion)
    })
    it('updating an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const event = yield* _($Event('foo')({ aggregateId: 'bar' })())
            yield* _($EventStore.publish(event))
            yield* _($EventStore.publish(event))
            const entity = yield* _(
              $EventSourcedEntity('foo')(
                {},
                { id: 'bar', version: 1, events: { uncommitted: [event] } },
              ),
            )

            return yield* _($Aggregate.saveToEventStore(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toBeUndefined()
    })
  })

  describe('saveToRepository', () => {
    it('saving a new entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _($MutableEntity('foo')({}, { id: 'bar' }))

            return yield* _($Aggregate.saveToRepository(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toBeUndefined()
    })
    it('saving an entity with the wrong version', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _($MutableEntity('foo')({}, { id: 'bar' }))
            yield* _(
              $Repository.insert({ ...entity, _: { ...entity._, version: 0 } }),
            )

            return yield* _($Aggregate.saveToRepository(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).rejects.toThrow(WrongEntityVersion)
    })
    it('updating an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _(
              $MutableEntity('foo')({}, { id: 'bar', version: 0 }),
            )
            yield* _($Repository.insert(entity))

            return yield* _($Aggregate.saveToRepository(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toBeUndefined()
    })
  })

  describe('save', () => {
    it('saving to event store', async () => {
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
            yield* _($Aggregate.save(aggregate)(entity))

            return yield* _($EventStore.events('bar'))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toHaveLength(1)
    })
    it('saving to repository', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const entity = yield* _($MutableEntity('foo')({}, { id: 'bar' }))
            yield* _($Aggregate.save({ type: 'foo' })(entity))

            return yield* _($Repository.find(entity))
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { id: 'bar' } })
    })
  })

  it('saving a stale entity', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const event = yield* _(
            $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
          )
          yield* _($EventStore.publish(event))
          yield* _($EventStore.publish(event))
          const entity = yield* _($Aggregate.load(aggregate)('bar'))
          yield* _($EventStore.publish(event))

          return yield* _($Aggregate.save(aggregate)(entity))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).rejects.toThrow(WrongEntityVersion)
  })
  it('updating an entity', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const event = yield* _(
            $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
          )
          yield* _($EventStore.publish(event))
          yield* _($EventStore.publish(event))
          const entity = yield* _($Aggregate.load(aggregate)('bar'))
          yield* _(
            $Aggregate.save(aggregate)({
              ...entity,
              _: { ...entity._, events: { uncommitted: [event] } },
            }),
          )

          return yield* _($Aggregate.load(aggregate)('bar'))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toMatchObject({
      _: { type: 'foo', id: 'bar', version: 2 },
      bar: 42 + 42 + 42,
    })
  })
})
