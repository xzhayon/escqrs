import { Effect, NonEmptyArray, Option, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { Body, Id, Type } from './Entity'
import { EntityNotFound } from './EntityNotFound'
import { Event } from './Event'
import { $EventSourcedEntity, EventSourcedEntity } from './EventSourcedEntity'
import { $EventStore } from './EventStore'
import { $Logger } from './Logger'
import { $MutableEntity, MutableEntity } from './MutableEntity'
import { $Reducer, Reducer } from './Reducer'
import { $Repository } from './Repository'
import { WrongEntityVersion } from './WrongEntityVersion'

const CHANNEL = 'Aggregate'

export type Aggregate<A extends MutableEntity> = A extends EventSourcedEntity
  ? { readonly type: Type<A>; readonly reducer: Reducer<A> }
  : { readonly type: Type<A> }

export function $Aggregate<A extends EventSourcedEntity, E extends Event>(
  type: Type<A>,
  reducer: {
    readonly [k in Type<E>]: (entity: Body<A> | undefined, event: E) => Body<A>
  },
): Aggregate<A>
export function $Aggregate<A extends MutableEntity>(type: Type<A>): Aggregate<A>
export function $Aggregate<A extends MutableEntity, E extends Event>(
  type: Type<A>,
  reducers?: {
    readonly [k in Type<E>]: (entity: Body<A> | undefined, event: E) => Body<A>
  },
) {
  return { type, reducer: reducers && $Reducer.compose(reducers) }
}

const isEventSourced = <A extends MutableEntity>(
  aggregate: Aggregate<A>,
): aggregate is Aggregate<A & EventSourcedEntity> => 'reducer' in aggregate

$Aggregate.loadFromEventStore =
  <A extends EventSourcedEntity>({ type, reducer }: Aggregate<A>) =>
  (id: Id<A>) =>
    gen(function* (_) {
      const _events = yield* _($EventStore.events(id))
      const events = yield* _(NonEmptyArray.fromArray(_events), () =>
        EntityNotFound.missingEvents(type, id),
      )

      return yield* _(
        $EventSourcedEntity.reduce(type, reducer as Reducer<A>)(id)(events),
        () => EntityNotFound.unreducibleEvents(type, id),
      )
    })

$Aggregate.loadFromRepository =
  <A extends MutableEntity>({ type }: Aggregate<A>) =>
  (id: Id<A>) =>
    $Repository.find({ _: { type, id } })

$Aggregate.load =
  <A extends MutableEntity>(aggregate: Aggregate<A>) =>
  (id: Id<A>) =>
    pipe(
      aggregate,
      isEventSourced,
      Effect.if(
        () =>
          $Aggregate.loadFromEventStore<A & EventSourcedEntity>(aggregate)(id),
        () => $Aggregate.loadFromRepository(aggregate)(id),
      ),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Aggregate not loaded', {
            aggregateType: aggregate.type,
            error,
            aggregateId: id,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Aggregate loaded', {
            aggregateType: aggregate.type,
            aggregateId: id,
            channel: CHANNEL,
          }),
      ),
    )

$Aggregate.saveToEventStore = <A extends EventSourcedEntity>(entity: A) =>
  gen(function* (_) {
    const events = yield* _($EventStore.events(entity._.id))
    if (entity._.version !== events.length - 1) {
      throw WrongEntityVersion.build(
        entity._.type,
        entity._.id,
        events.length - 1,
        entity._.version,
      )
    }

    for (const event of entity._.events.uncommitted) {
      yield* _($EventStore.publish(event))
    }
  })

$Aggregate.saveToRepository = <A extends MutableEntity>(entity: A) =>
  pipe(
    $Repository.find<A>(entity),
    Effect.map(({ _ }) => _.version),
    Effect.catchSome((error) =>
      error instanceof EntityNotFound
        ? Option.some(Effect.succeed(-1))
        : Option.none,
    ),
    Effect.reject((version) =>
      entity._.version !== version
        ? Option.some(
            WrongEntityVersion.build(
              entity._.type,
              entity._.id,
              version,
              entity._.version,
            ),
          )
        : Option.none,
    ),
    Effect.as(entity),
    Effect.chain($MutableEntity.bump),
    Effect.map((entity) => 0 === entity._.version),
    Effect.ifM(
      () => $Repository.insert(entity),
      () => $Repository.update(entity),
    ),
    Effect.asUnit,
  )

$Aggregate.save =
  <A extends MutableEntity>(aggregate: Aggregate<A>) =>
  (entity: A) =>
    pipe(
      aggregate,
      isEventSourced,
      Effect.if(
        () => $Aggregate.saveToEventStore(entity as A & EventSourcedEntity),
        () => $Aggregate.saveToRepository(entity),
      ),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Aggregate not saved', {
            aggregateType: aggregate.type,
            error,
            aggregateId: entity._.id,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Aggregate saved', {
            aggregateType: aggregate.type,
            aggregateId: entity._.id,
            channel: CHANNEL,
          }),
      ),
    )
