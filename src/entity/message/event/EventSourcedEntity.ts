import { Array as _Array, Option, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { DeepPartial } from '../../../DeepPartial'
import { Body, Header, Id, Type } from '../../Entity'
import {
  $MutableEntity,
  $MutableEntityC,
  MutableEntity,
} from '../../MutableEntity'
import { $EventC, Event } from './Event'
import { Reducer } from './Reducer'

export interface EventSourcedEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends MutableEntity<
    T,
    I,
    H & { readonly events: { readonly uncommitted: _Array.Array<Event> } }
  > {}

export const $EventSourcedEntityC = <
  T extends t.Type<string>,
  I extends t.Type<string>,
  H extends t.Type<{ readonly [K: string]: unknown }>,
>(
  tC: T = t.string as unknown as T,
  iC: I = t.string as unknown as I,
  hC: H = t.type({}) as unknown as H,
  name?: string,
): t.Type<
  EventSourcedEntity<t.TypeOf<T>, t.TypeOf<I>, t.TypeOf<H>>,
  EventSourcedEntity<t.OutputOf<T>, t.OutputOf<I>, t.OutputOf<H>>
> =>
  $MutableEntityC(
    tC,
    iC,
    t.intersection([
      hC,
      t.readonly(
        t.type({
          events: t.readonly(
            t.type({
              uncommitted: t.readonlyArray($EventC()),
            }),
          ),
        }),
        'EventSourcedEntityHeader',
      ),
    ]) as t.Mixed,
    name ?? 'EventSourcedEntity',
  )

export function $EventSourcedEntity<A extends EventSourcedEntity>(
  type: Type<A>,
) {
  return (body: Body<A>, header?: DeepPartial<Omit<Header<A>, 'type'>>) =>
    gen(function* (_) {
      return yield* _(
        $MutableEntity(type)(body, {
          ...header,
          events: {
            ...header?.events,
            uncommitted: header?.events?.uncommitted ?? [],
          },
        } as DeepPartial<Omit<Header<A>, 'type'>>),
      )
    })
}

const fold =
  <A extends EventSourcedEntity>(type: Type<A>, reducer: Reducer<A>) =>
  (id: Id<A>) =>
  (entity: A | undefined) =>
  (events: _Array.Array<Event>, uncommitted = false) =>
    pipe(
      events,
      _Array.filter(
        (event) => id === event.aggregateId || id === event._.correlationId,
      ),
      _Array.reduceWithIndex(
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
  (events: _Array.Array<Event>) =>
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
