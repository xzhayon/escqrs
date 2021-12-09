import { Array, Effect, Has, NonEmptyArray, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'
import { $Logger, Logger } from '../../logger/Logger'
import { Body, Entity, Header } from '../Entity'
import { EntityNotFound } from './EntityNotFound'

const CHANNEL = 'Repository'

export interface Repository {
  readonly insert: <A extends Entity>(entity: A) => Effect.IO<Error, void>
  readonly find: <A extends Entity>(
    entity: {
      readonly _: Pick<Header<A>, 'type'> & Partial<Header<A>>
    } & Partial<Body<A>>,
  ) => Effect.IO<Error, Array.Array<A>>
  readonly update: <A extends Entity>(
    entity: { readonly _: Pick<Header<A>, 'type' | 'id'> } & Partial<Body<A>>,
  ) => Effect.IO<EntityNotFound | Error, A>
  readonly delete: <A extends Entity>(
    entity: {
      readonly _: Pick<Header<A>, 'type' | 'id'>
    } & Partial<Body<A>>,
  ) => Effect.IO<EntityNotFound | Error, void>
}

export const HasRepository = Has.tag<Repository>()

const { insert: _insert, delete: __delete } = Effect.deriveLifted(
  HasRepository,
)(['insert', 'delete'], [], [])
const { find: _find, update: _update } = Effect.deriveAccessM(HasRepository)([
  'find',
  'update',
])

const insert = <A extends Entity>(entity: A) =>
  pipe(
    _insert(entity),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Entity not inserted', {
          entityType: entity._.type,
          error,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Entity inserted', {
          entityType: entity._.type,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
    ),
  )

function find<A extends Entity>(
  entity: { readonly _: Pick<Header<A>, 'type' | 'id'> } & Partial<Body<A>>,
): Effect.Effect<
  HasClock & Has.Has<Logger> & Has.Has<Repository>,
  EntityNotFound | Error,
  NonEmptyArray.NonEmptyArray<A>
>
function find<A extends Entity>(
  entity: {
    readonly _: Pick<Header<A>, 'type'> & Partial<Header<A>>
  } & Partial<Body<A>>,
): Effect.Effect<
  HasClock & Has.Has<Logger> & Has.Has<Repository>,
  EntityNotFound | Error,
  Array.Array<A>
>
function find<A extends Entity>(
  entity:
    | ({ readonly _: Pick<Header<A>, 'type' | 'id'> } & Partial<Body<A>>)
    | ({
        readonly _: Pick<Header<A>, 'type'> & Partial<Header<A>>
      } & Partial<Body<A>>),
): Effect.Effect<
  HasClock & Has.Has<Logger> & Has.Has<Repository>,
  EntityNotFound | Error,
  NonEmptyArray.NonEmptyArray<A> | Array.Array<A>
> {
  return pipe(
    gen(function* (_) {
      const entities = yield* _(_find((f) => f(entity)))
      if (undefined !== entity._.id) {
        const id = entity._.id

        return yield* _(NonEmptyArray.fromArray(entities), () =>
          EntityNotFound.build(entity._.type, id),
        )
      }

      return entities
    }),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Entity not found', {
          entityType: entity._.type,
          error,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Entity found', {
          entityType: entity._.type,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
    ),
  )
}

const update = <A extends Entity>(
  entity: { readonly _: Pick<Header<A>, 'type' | 'id'> } & Partial<Body<A>>,
) =>
  pipe(
    _update((f) => f(entity)),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Entity not updated', {
          entityType: entity._.type,
          error,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Entity updated', {
          entityType: entity._.type,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
    ),
  )

const _delete = <A extends Entity>(entity: {
  readonly _: Pick<Header<A>, 'type' | 'id'>
}) =>
  pipe(
    __delete(entity),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Entity not deleted', {
          entityType: entity._.type,
          error,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Entity deleted', {
          entityType: entity._.type,
          entityId: entity._.id,
          channel: CHANNEL,
        }),
    ),
  )

export const $Repository = { insert, find, update, delete: _delete }
