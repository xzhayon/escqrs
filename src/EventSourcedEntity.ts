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
  (events: Array.Array<Event>, uncommitted = false) =>
    pipe(
      events,
      Array.filter(
        (event) => id === event.aggregateId || id === event._.correlationId,
      ),
      Array.reduceWithIndex(
        [
          Option.fromNullable(entity?._),
          Option.fromNullable(entity),
        ] as Readonly<[Option.Option<Header<A>>, Option.Option<Body<A>>]>,
        (version, [header, body], event) =>
          [
            pipe(
              header,
              Option.toUndefined,
              (_header) => ({
                type,
                id,
                date: {
                  created: _header?.date.created ?? event._.date,
                  updated: event._.date,
                },
                version: uncommitted ? entity?._.version ?? -1 : version,
                events: {
                  uncommitted: uncommitted
                    ? [...(_header?.events.uncommitted ?? []), event]
                    : [],
                },
              }),
              Option.some,
            ),
            pipe(
              body,
              Option.toUndefined,
              (_body) => reducer(_body, event),
              Option.fromNullable,
            ),
          ] as const,
      ),
    )

$EventSourcedEntity.reduce =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
  (id: Id<A>) =>
  (events: Array.Array<Event>) =>
    Option.gen(function* (_) {
      const [header, body] = fold(type, reducer)(id)(undefined)(events)

      return { ...(yield* _(body)), _: yield* _(header) } as A
    })

$EventSourcedEntity.applyEvent =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
  (event: Event, entity?: A) =>
    pipe(
      fold(type, reducer)(entity?._.id ?? event.aggregateId)(entity)(
        [event],
        true,
      )[0],
      Option.map((_) => ({ _ })),
    )
