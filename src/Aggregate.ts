import { Effect, NonEmptyArray, Option, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { EOf, ROf } from './Effect'
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

export interface Aggregate<A extends MutableEntity> {
  readonly load: (id: Id<A>) => Effect.Effect<ROf<Load>, EOf<Load>, A>
  readonly save: (entity: A) => Effect.Effect<ROf<Save>, EOf<Save>, void>
}

type Load = ReturnType<ReturnType<typeof load>>
type Save = ReturnType<ReturnType<typeof save>>

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
    readonly [k in Type<E>]: (
      entity: Body<A & EventSourcedEntity> | undefined,
      event: E,
    ) => Body<A & EventSourcedEntity>
  },
): Aggregate<A> {
  const reducer = reducers && $Reducer.compose(reducers)

  return reducer
    ? { load: load(type, reducer), save: save(type, reducer) }
    : { load: load(type), save: save(type) }
}

const loadFromEventStore =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
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

const loadFromRepository =
  <A extends MutableEntity>(type: Type<A>) =>
  (id: Id<A>) =>
    $Repository.find({ _: { type, id } })

const load =
  <A extends MutableEntity>(
    type: Type<A>,
    reducer?: Reducer<A & EventSourcedEntity>,
  ) =>
  (id: Id<A>) =>
    pipe(
      reducer,
      Effect.fromNullable,
      Effect.foldM(
        () => loadFromRepository(type)(id),
        (reducer) =>
          loadFromEventStore<A & EventSourcedEntity>(type, reducer)(id),
      ),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Aggregate not loaded', {
            aggregateType: type,
            error,
            aggregateId: id,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Aggregate loaded', {
            aggregateType: type,
            aggregateId: id,
            channel: CHANNEL,
          }),
      ),
    )

const saveToEventStore = <A extends EventSourcedEntity>(entity: A) =>
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

const saveToRepository = <A extends MutableEntity>(entity: A) =>
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
    Effect.chain(() =>
      gen(function* (_) {
        const _entity = yield* _($MutableEntity.bump(entity))
        0 === _entity._.version
          ? yield* _($Repository.insert(_entity))
          : yield* _($Repository.update(_entity))
      }),
    ),
  )

const save =
  <A extends MutableEntity>(
    type: Type<A>,
    reducer?: Reducer<A & EventSourcedEntity>,
  ) =>
  (entity: A) =>
    pipe(
      undefined !== reducer,
      Effect.if(
        () => saveToEventStore(entity as A & EventSourcedEntity),
        () => saveToRepository(entity),
      ),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Aggregate not saved', {
            aggregateType: type,
            error,
            aggregateId: entity._.id,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Aggregate saved', {
            aggregateType: type,
            aggregateId: entity._.id,
            channel: CHANNEL,
          }),
      ),
    )
