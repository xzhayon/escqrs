import { Effect, Managed, Option, pipe, Record, Ref } from '@effect-ts/core'
import { flow } from '@effect-ts/system/Function'
import { $Logger } from '../../Logger'
import { Entity } from '../Entity'
import { Repository } from '../Repository'

const CHANNEL = 'InMemoryRepository'

export const $InMemoryRepository = pipe(
  Effect.do,
  Effect.bind('entities', () =>
    Ref.makeRef(Record.empty as Record.Dictionary<Record.Dictionary<Entity>>),
  ),
  Effect.tap(() =>
    $Logger.debug('Connection to in-memory repository opened', {
      entitiesCount: 0,
      channel: CHANNEL,
    }),
  ),
  Effect.map(({ entities }) => {
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
        readonly _: Pick<A['_'], 'type' | 'id'>
      }) =>
        pipe(
          entities.get,
          Effect.chain(flow(Record.lookup(type), Effect.fromOption)),
          Effect.chain(flow(Record.lookup(id), Effect.fromOption)),
          Effect.mapBoth(
            () => Error(`Cannot find entity "${id}" of type "${type}"`),
            (entity) => entity as A,
          ),
        ),
      update: <A extends Entity>(
        entity: {
          readonly _: Pick<A['_'], 'type' | 'id'>
        } & Partial<Omit<A, '_'>>,
      ) =>
        pipe(
          repository.find(entity),
          Effect.map((_entity) => ({ ..._entity, ...entity })),
          Effect.tap((_entity) => repository.insert(_entity)),
        ),
      delete: (entity) =>
        pipe(
          repository.find(entity),
          Effect.map(() => entities),
          Effect.chain(
            Ref.updateSome(
              Record.modifyAt(entity._.type, Record.deleteAt(entity._.id)),
            ),
          ),
        ),
    }

    return { ...repository, entities }
  }),
  Managed.make(
    flow(
      Effect.succeed,
      Effect.bind('_entities', ({ entities }) => entities.get),
      Effect.tap(({ _entities }) =>
        $Logger.debug('Connection to in-memory repository closed', {
          entitiesCount: pipe(
            _entities,
            Record.reduce(0, (count, type) => count + Record.size(type)),
          ),
          channel: CHANNEL,
        }),
      ),
    ),
  ),
)
