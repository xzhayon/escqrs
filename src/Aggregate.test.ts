import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { $Aggregate } from './Aggregate'
import { Body } from './Entity'
import { EntityNotFound } from './EntityNotFound'
import { $Event, Event } from './Event'
import { $EventSourcedEntity, EventSourcedEntity } from './EventSourcedEntity'
import { $EventStore } from './EventStore'
import { $MutableEntity, MutableEntity } from './MutableEntity'
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
  describe('load', () => {
    it('failing when there is no entity', async () => {
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
    it('failing when loading an entity of the wrong kind', async () => {
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
    it('loading from event store', async () => {
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
    it('loading from repository', async () => {
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
            yield* _(aggregate.save(entity))

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
            yield* _($Aggregate('foo').save(entity))

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
  it('updating an entity', async () => {
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
