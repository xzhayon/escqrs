import {
  Array,
  Branded,
  Effect,
  Either,
  Function,
  NonEmptyArray,
  Option,
  pipe,
} from '@effect-ts/core'
import { MutableEntity } from '../entities/Entity'
import { $Logger } from '../Logger'
import { Event } from '../messages/events/Event'
import { $EventStore } from '../messages/events/EventStore'
import { $Reducer, Reducer } from './Reducer'

const CHANNEL = 'Aggregate'

export interface Aggregate<A extends AggregateRoot = AggregateRoot> {
  readonly type: A['_']['type']
  readonly reducer: Reducer<A>
}

export interface AggregateRoot<A extends string = string>
  extends Branded.Branded<
    MutableEntity<`Aggregate.${A}`, AggregateId, { readonly version: number }>,
    'AggregateRoot'
  > {}

export type AggregateId = Branded.Branded<string, 'AggregateId'>

export const $AggregateId = (id: string): AggregateId => id as AggregateId

export function $Aggregate<A extends AggregateRoot, E extends Event >(
  type: A['_']['type'],
  reducers: {
    readonly [k in E['_']['type']]: Reducer<
      A,
      Extract<E, { readonly _: { readonly type: k } }>
    >
  },
): Aggregate<A> {
  return pipe(reducers, $Reducer.fromReducers, (reducer) => ({ type, reducer }))
}

$Aggregate.reduce =
  <A extends AggregateRoot>(aggregate: Aggregate<A>, id: AggregateId) =>
  (events: Array.Array<Event>) =>
    pipe(
      events,
      Array.filter(
        (event) =>
          id === event.aggregateId ||
          id === $AggregateId(event._.correlationId),
      ),
      Array.reduceWithIndex(
        Option.none as Option.Option<A>,
        (version, entity, event) =>
          pipe(
            aggregate.reducer(event, entity) as Option.Option<A>,
            Option.map((entity) => ({
              ...entity,
              _: {
                ...entity._,
                type: aggregate.type,
                id,
                version: version + 1,
                dateCreated: entity._?.dateCreated ?? event._.date,
                dateUpdated: event._.date,
              },
            })),
          ) as Option.Option<AggregateRoot> as Option.Option<A>,
      ),
    )

$Aggregate.load =
  <A extends AggregateRoot>(aggregate: Aggregate<A>) =>
  (aggregateId: AggregateId) =>
    pipe(
      aggregateId,
      $EventStore.eventsByAggregateId,
      Effect.map(NonEmptyArray.fromArray),
      Effect.map(
        Either.fromOption(() =>
          Error(
            `Cannot find events for aggregate root "${aggregateId}" of type "${aggregate.type}"`,
          ),
        ),
      ),
      Effect.map(Function.constant),
      Effect.chain(Effect.fromEither),
      Effect.map($Aggregate.reduce(aggregate, aggregateId)),
      Effect.map(
        Either.fromOption(() =>
          Error(
            `Cannot reduce events into aggregate root "${aggregateId}" of type "${aggregate.type}"`,
          ),
        ),
      ),
      Effect.map(Function.constant),
      Effect.chain(Effect.fromEither),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Aggregate root not loaded', {
            aggregateType: aggregate.type,
            error,
            aggregateId,
            channel: CHANNEL,
          }),
        ({ _: { version } }) =>
          $Logger.debug('Aggregate root loaded', {
            aggregateType: aggregate.type,
            aggregateId,
            aggregateVersion: version,
            channel: CHANNEL,
          }),
      ),
    )
