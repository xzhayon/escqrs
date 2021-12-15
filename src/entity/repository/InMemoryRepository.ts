import {
  Array,
  Effect,
  Equal,
  Managed,
  NonEmptyArray,
  Option,
  pipe,
  Record,
  Ref,
} from '@effect-ts/core'
import * as Dictionary from '@effect-ts/core/Collections/Immutable/Dictionary'
import { gen } from '@effect-ts/system/Effect'
import { $Logger } from '../../logger/Logger'
import { Body, Entity, Header } from '../Entity'
import { EntityNotFound } from './EntityNotFound'
import { Repository } from './Repository'

const CHANNEL = 'InMemoryRepository'

export const $InMemoryRepository = pipe(
  gen(function* (_) {
    const entities = yield* _(
      Ref.makeRef<Record.Dictionary<Record.Dictionary<Entity>>>(Record.empty),
    )

    yield* _(
      $Logger.debug('Repository created', {
        entitiesCount: 0,
        channel: CHANNEL,
      }),
    )

    const repository: Repository = {
      insert: <A extends Entity>(entity: A) =>
        pipe(
          entities,
          Ref.update((_entities) =>
            pipe(
              _entities as Record.Dictionary<Record.Dictionary<A>>,
              Record.modifyAt(
                entity._.type,
                Record.insertAt(entity._.id, entity),
              ),
              Option.getOrElse(() =>
                pipe(
                  _entities as Record.Dictionary<Record.Dictionary<A>>,
                  Record.insertAt(entity._.type, { [entity._.id]: entity }),
                ),
              ),
            ),
          ),
        ),
      find: <A extends Entity>({
        _: header,
        ...body
      }: { readonly _: Pick<Header<A>, 'type'> & Partial<Header<A>> } & Partial<
        Body<A>
      >) =>
        pipe(
          gen(function* (_) {
            const _entities = yield* _(entities.get)
            const collection = yield* _(
              Record.lookup(header.type)(_entities),
              Error,
            )
            if (undefined !== header.id) {
              const entity = yield* _(
                Record.lookup(header.id)(collection),
                Error,
              )

              return [entity as A]
            }

            return pipe(
              collection,
              Record.values,
              Array.filter((entity) =>
                pipe(
                  body as Dictionary.Dictionary<unknown>,
                  Record.isSubrecord(Equal.strict())(
                    entity as unknown as Dictionary.Dictionary<unknown>,
                  ),
                ),
              ),
            ) as Array.Array<A>
          }),
          Effect.catchAll(() => Effect.succeed(Array.emptyOf<A>())),
        ),
      update: <A extends Entity>(
        entity: { readonly _: Pick<Header<A>, 'type' | 'id'> } & Partial<
          Body<A>
        >,
      ) =>
        gen(function* (_) {
          const _entities = yield* _(repository.find(entity))
          const _entity = yield* _(Array.head(_entities), () =>
            EntityNotFound.build(entity._.type, entity._.id),
          )
          const __entity = { ..._entity, ...entity }
          yield* _(repository.insert(__entity))

          return __entity
        }),
      delete: (entity) =>
        gen(function* (_) {
          const _entities = yield* _(repository.find(entity))
          yield* _(NonEmptyArray.fromArray(_entities), () =>
            EntityNotFound.build(entity._.type, entity._.id),
          )

          yield* _(
            pipe(
              entities,
              Ref.updateSome(
                Record.modifyAt(entity._.type, Record.deleteAt(entity._.id)),
              ),
            ),
          )
        }),
    }

    return { repository, _entities: entities }
  }),
  Managed.make(({ _entities }) =>
    gen(function* (_) {
      const entities = yield* _(_entities.get)
      yield* _(_entities.set(Record.empty))
      yield* _(
        $Logger.debug('Repository destroyed', {
          entitiesCount: pipe(
            entities,
            Record.reduce(0, (count, type) => count + Record.size(type)),
          ),
          channel: CHANNEL,
        }),
      )
    }),
  ),
  Managed.map(({ repository }) => repository),
)
