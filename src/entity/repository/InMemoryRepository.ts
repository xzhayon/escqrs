import { Effect, Managed, Option, pipe, Record, Ref } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { flow } from '@effect-ts/system/Function'
import { $Logger } from '../../logger/Logger'
import { Body, Entity, Header } from '../Entity'
import { EntityNotFound } from './EntityNotFound'
import { Repository } from './Repository'

const CHANNEL = 'InMemoryRepository'

export const $InMemoryRepository = pipe(
  gen(function* (_) {
    const entities = yield* _(
      Ref.makeRef(Record.empty as Record.Dictionary<Record.Dictionary<Entity>>),
    )

    yield* _(
      $Logger.debug('Connection to in-memory repository opened', {
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
        _: { type, id },
      }: {
        readonly _: Pick<Header<A>, 'type' | 'id'>
      }) =>
        pipe(
          entities.get,
          Effect.chain(flow(Record.lookup(type), Effect.fromOption)),
          Effect.chain(flow(Record.lookup(id), Effect.fromOption)),
          Effect.mapBoth(
            () => EntityNotFound.build(type, id),
            (entity) => entity as A,
          ),
        ),
      update: <A extends Entity>(
        entity: {
          readonly _: Pick<Header<A>, 'type' | 'id'>
        } & Partial<Body<A>>,
      ) =>
        pipe(
          repository.find(entity),
          Effect.map((_entity) => ({ ..._entity, ...entity })),
          Effect.tap(repository.insert),
        ),
      delete: (entity) =>
        pipe(
          repository.find(entity),
          Effect.as(entities),
          Effect.chain(
            Ref.updateSome(
              Record.modifyAt(entity._.type, Record.deleteAt(entity._.id)),
            ),
          ),
        ),
    }

    return { ...repository, entities }
  }),
  Managed.make(({ entities }) =>
    gen(function* (_) {
      yield* _(
        $Logger.debug('Connection to in-memory repository closed', {
          entitiesCount: pipe(
            yield* _(entities.get),
            Record.reduce(0, (count, type) => count + Record.size(type)),
          ),
          channel: CHANNEL,
        }),
      )
    }),
  ),
  Managed.map(({ entities, ...repository }) => repository),
)
