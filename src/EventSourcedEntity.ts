import { Array, Option, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { Body, Header, Id, Type } from './Entity'
import { Event } from './Event'
import { $MutableEntity, MutableEntity } from './MutableEntity'
import { PartialDeep } from './PartialDeep'
import { Reducer } from './Reducer'

export interface EventSourcedEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends MutableEntity<
    T,
    I,
    H & { readonly events: { readonly uncommitted: Array.Array<Event> } }
  > {}

export function $EventSourcedEntity<A extends EventSourcedEntity>(
  type: Type<A>,
) {
  return (body: Body<A>, header?: PartialDeep<Omit<Header<A>, 'type'>>) =>
    gen(function* (_) {
      return yield* _(
        $MutableEntity(type)(body, {
          ...header,
          events: {
            ...header?.events,
            uncommitted: header?.events?.uncommitted ?? [],
          },
        } as PartialDeep<Omit<Header<A>, 'type'>>),
      )
    })
}

const fold =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
  (id: Id<A>) =>
  (entity: A | undefined) =>
  (events: Array.Array<Event>) =>
    pipe(
      events,
      Array.filter(
        (event) => id === event.aggregateId || id === event._.correlationId,
      ),
      Array.reduceWithIndex(
        Option.fromNullable(entity) as Option.Option<A>,
        (version, _entity, event) =>
          pipe(
            reducer(Option.toUndefined(_entity), event),
            Option.fromNullable,
            Option.map(
              (body) =>
                ({
                  ...body,
                  _: {
                    type,
                    id,
                    date: {
                      created:
                        Option.toUndefined(_entity)?._.date.created ??
                        event._.date,
                      updated: event._.date,
                    },
                    version: entity?._.version ?? version,
                    events: {
                      uncommitted:
                        undefined !== entity
                          ? [
                              ...(Option.toUndefined(_entity)?._.events
                                .uncommitted ?? []),
                              event,
                            ]
                          : [],
                    },
                  },
                } as EventSourcedEntity as A),
            ),
          ),
      ),
    )

$EventSourcedEntity.reduce =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
  (id: Id<A>) =>
    fold(type, reducer)(id)(undefined)

$EventSourcedEntity.applyEvent =
  <A extends EventSourcedEntity>(reducer: Reducer<A>) =>
  (event: Event) =>
  (entity: A) =>
    fold(entity._.type, reducer)(entity._.id)(entity)([event])
