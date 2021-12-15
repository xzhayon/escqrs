import {
  Branded,
  Effect,
  Either,
  NonEmptyArray,
  Option,
  pipe,
} from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { EOf, ROf } from './Effect'
import { Body, Header, Id, Type } from './entity/Entity'
import { Event } from './entity/message/event/Event'
import {
  $EventSourcedEntity,
  EventSourcedEntity,
} from './entity/message/event/EventSourcedEntity'
import { $EventStore } from './entity/message/event/eventstore/EventStore'
import { $Reducer, Reducer } from './entity/message/event/Reducer'
import { $MutableEntity, MutableEntity } from './entity/MutableEntity'
import { EntityNotFound } from './entity/repository/EntityNotFound'
import { $Repository } from './entity/repository/Repository'
import { $Logger } from './logger/Logger'
import { WrongEntityVersion } from './WrongEntityVersion'

const CHANNEL = 'Aggregate'

export type Aggregate<A extends MutableEntity> = A extends EventSourcedEntity
  ? _Aggregate<A & EventSourcedEntity> & {
      readonly apply: (
        event: Event,
      ) => (
        entity?: A & EventSourcedEntity,
      ) => Either.Either<EntityNotFound, Pick<A & EventSourcedEntity, '_'>>
      readonly save: (
        entity: Pick<A & EventSourcedEntity, '_'>,
      ) => Effect.Effect<ROf<Save>, EOf<Save>, void>
    }
  : _Aggregate<A> & {
      readonly save: (entity: A) => Effect.Effect<ROf<Save>, EOf<Save>, void>
      readonly delete: (
        id: Id<A>,
      ) => Effect.Effect<ROf<Delete>, EOf<Delete>, void>
    }

interface _Aggregate<A extends MutableEntity> {
  readonly id: (id: string) => Id<A>
  readonly load: (id: Id<A>) => Effect.Effect<ROf<Load>, EOf<Load>, A>
}

type Load = ReturnType<ReturnType<typeof load>>
type Save = ReturnType<ReturnType<typeof save>>
type Delete = ReturnType<ReturnType<typeof _delete>>

export function $Aggregate<A extends EventSourcedEntity, E extends Event<A>>(
  type: Type<A>,
  reducer: {
    readonly [k in Type<E>]: Reducer<A, Extract<E, { _: { readonly type: k } }>>
  },
): Aggregate<A & EventSourcedEntity>
export function $Aggregate<A extends MutableEntity>(type: Type<A>): Aggregate<A>
export function $Aggregate<A extends MutableEntity, E extends Event<A>>(
  type: Type<A>,
  reducers?: {
    readonly [k in Type<E>]: Reducer<
      A & EventSourcedEntity,
      Extract<E, { _: { readonly type: k } }>
    >
  },
) {
  const aggregate = {
    id: (id: string) => Branded.makeBranded(id),
    save: save(type),
  }
  const reducer = reducers && $Reducer.compose(reducers)

  return reducer
    ? {
        ...aggregate,
        load: load(type, reducer),
        apply: apply<A & EventSourcedEntity>(type, reducer),
      }
    : { ...aggregate, load: load(type), delete: _delete(type) }
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
        $EventSourcedEntity.reduce(type, reducer)(id)(events),
        () => EntityNotFound.unreducibleEvents(type, id),
      )
    })

const loadFromRepository =
  <A extends MutableEntity>(type: Type<A>) =>
  (id: Id<A>) =>
    pipe(
      $Repository.find({ _: { type, id } } as {
        readonly _: Pick<Header<A>, 'type' | 'id'> & Partial<Header<A>>
      } & Partial<Body<A>>),
      Effect.map(NonEmptyArray.head),
    )

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

const apply =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
  (event: Event) =>
  (entity?: A) =>
    pipe(
      $EventSourcedEntity.applyEvent(type, reducer)(event, entity),
      Either.fromOption(() =>
        EntityNotFound.missingEvents(type, event.aggregateId),
      ),
    )

const saveToEventStore = <A extends EventSourcedEntity>(entity: Pick<A, '_'>) =>
  gen(function* (_) {
    const events = yield* _($EventStore.events(entity._.id))
    if (entity._.version !== events.length - 1) {
      yield* _(
        Effect.fail(
          WrongEntityVersion.build(
            entity._.type,
            entity._.id,
            events.length - 1,
            entity._.version,
          ),
        ),
      )
    }

    for (const event of entity._.events.uncommitted) {
      yield* _($EventStore.publish(event))
    }
  })

const saveToRepository = <A extends MutableEntity>(entity: A) =>
  pipe(
    $Repository.find<A>(entity),
    Effect.map(NonEmptyArray.head),
    Effect.map(({ _ }) => _.version),
    Effect.catchSome((error) =>
      -1 === entity._.version && error instanceof EntityNotFound
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
  <A extends MutableEntity>(type: Type<A>) =>
  (entity: Pick<A & EventSourcedEntity, '_'> | A) =>
    pipe(
      'events' in entity._,
      Effect.if(
        () => saveToEventStore(entity as Pick<A & EventSourcedEntity, '_'>),
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

const _delete =
  <A extends MutableEntity>(type: Type<A>) =>
  (id: Id<A>) =>
    pipe(
      $Repository.delete({ _: { type, id } }),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Aggregate not deleted', {
            aggregateType: type,
            error,
            aggregateId: id,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Aggregate deleted', {
            aggregateType: type,
            aggregateId: id,
            channel: CHANNEL,
          }),
      ),
    )
