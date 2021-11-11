import { Branded, Option } from '@effect-ts/core'
import { Event } from '../messages/events/Event'
import { AggregateRoot } from './Aggregate'

export interface Reducer<
  A extends AggregateRoot = AggregateRoot,
  E extends Event = Event,
> {
  (event: E, entity: Option.Option<A>): Option.Option<
    Omit<A, '_' | keyof Branded.Brand<any>>
  >
}

const fromReducers =
  <A extends AggregateRoot, E extends Event>(reducers: {
    readonly [k in E['_']['type']]: Reducer<
      A,
      Extract<E, { readonly _: { readonly type: k } }>
    >
  }): Reducer<A> =>
  (event, entity) =>
    event._.type in reducers
      ? reducers[event._.type as E['_']['type']](
          event as Extract<
            E,
            { readonly _: { readonly type: E['_']['type'] } }
          >,
          entity,
        )
      : entity

export const $Reducer = { fromReducers }
