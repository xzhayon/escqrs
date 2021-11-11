import { Effect, Has, pipe } from '@effect-ts/core'
import { $Logger } from '../Logger'
import { Entity } from './Entity'

const CHANNEL = 'Repository'

export interface Repository {
  readonly insert: <A extends Entity>(entity: A) => Effect.IO<Error, void>
  readonly find: <A extends Entity>(entity: {
    readonly _: Pick<A['_'], 'type' | 'id'>
  }) => Effect.IO<Error, A>
  readonly update: <A extends Entity>(
    entity: { readonly _: Pick<A['_'], 'type' | 'id'> } & Partial<Omit<A, '_'>>,
  ) => Effect.IO<Error, A>
  readonly delete: <A extends Entity>(entity: {
    readonly _: Pick<A['_'], 'type' | 'id'>
  }) => Effect.IO<Error, void>
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

const find = <A extends Entity>(entity: {
  readonly _: Pick<A['_'], 'type' | 'id'>
}) =>
  pipe(
    _find((f) => f(entity)),
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

const update = <A extends Entity>(
  entity: {
    readonly _: Pick<A['_'], 'type' | 'id'> &
      Partial<Omit<A['_'], 'type' | 'id'>>
  } & Partial<Omit<A, '_'>>,
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
  readonly _: Pick<A['_'], 'type' | 'id'>
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
