import { Branded, Option } from '@effect-ts/core'
import { PartialDeep } from '../../../PartialDeep'
import { Header, Id } from '../../Entity'
import { $Message } from '../Message'
import { Event } from './Event'
import { $EventSourcedEntity, EventSourcedEntity } from './EventSourcedEntity'
import { Reducer } from './Reducer'

interface Foo extends EventSourcedEntity<'foo'> {
  readonly bar: number
}

const reducer: Reducer<Foo> = (entity, event) =>
  'bar' in event
    ? entity
      ? { ...entity, bar: entity.bar + ((event as any).bar ?? 0) }
      : { bar: (event as any).bar }
    : undefined

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

describe('EventSourcedEntity', () => {
  describe('reduce', () => {
    const reduce = $EventSourcedEntity.reduce<Foo>('foo', reducer)('bar')

    test('returning no entity with no events', () => {
      expect(reduce([])).toStrictEqual(Option.none)
    })
    test('excluding events with different aggregate IDs', () => {
      expect(reduce([event('mad'), event('max')])).toStrictEqual(Option.none)
    })
    test('reducing events into an entity', () => {
      const date = new Date()

      expect(
        reduce([
          event('bar', { bar: 42 }, { date }),
          event('mad'),
          event('bar', { bar: 1138 }, { date }),
          event('max'),
          event('bar', { bar: 1337 }, { date }),
        ]),
      ).toStrictEqual(
        Option.some({
          _: {
            type: 'foo',
            id: 'bar',
            date: { created: date, updated: date },
            version: 2,
            events: { uncommitted: [] },
          },
          bar: 42 + 1138 + 1337,
        }),
      )
    })
    test('deleting an entity when the reducer returns `undefined`', () => {
      expect(reduce([event('bar', { bar: 42 }), event('bar')])).toStrictEqual(
        Option.none,
      )
    })
  })

  describe('applyEvent', () => {
    test('applying an event of another entity', () => {
      const _entity = entity('bar')

      expect(
        $EventSourcedEntity.applyEvent('foo', reducer)(
          event('foo', { bar: 42 }),
          _entity,
        ),
      ).toStrictEqual(Option.some({ _: _entity._ }))
    })
    test('applying an event', () => {
      const created = new Date(42)
      const updated = new Date(1138)
      const _entity = entity('bar', { date: { created, updated: created } })
      const _event = event('bar', { bar: 42 }, { date: updated })

      expect(
        $EventSourcedEntity.applyEvent('foo', reducer)(_event, _entity),
      ).toStrictEqual(
        Option.some({
          _: {
            ..._entity._,
            date: { ..._entity._.date, updated },
            events: { uncommitted: [_event] },
          },
        }),
      )
    })
    test('applying an event that nullifies the entity', () => {
      const created = new Date(42)
      const updated = new Date(1138)
      const _entity = entity('bar', { date: { created, updated: created } })
      const _event = event('bar', {}, { date: updated })

      expect(
        $EventSourcedEntity.applyEvent('foo', reducer)(_event, _entity),
      ).toStrictEqual(
        Option.some({
          _: {
            ..._entity._,
            date: { ..._entity._.date, updated },
            events: { uncommitted: [_event] },
          },
        }),
      )
    })
  })
})
