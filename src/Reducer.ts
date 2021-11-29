import { Body, Entity, Type } from './Entity'
import { Event } from './Event'

export interface Reducer<A extends Entity = Entity, E extends Event = Event> {
  (entity: Body<A> | undefined, event: E): Body<A> | undefined
}

const compose =
  <A extends Entity, E extends Event>(reducers: {
    readonly [k in Type<E>]: Reducer<
      A,
      Extract<E, { readonly _: { readonly type: k } }>
    >
  }): Reducer<A> =>
  (entity, event) =>
    event._.type in reducers
      ? reducers[event._.type as Type<E>](
          entity,
          event as Extract<E, { readonly _: { readonly type: Type<E> } }>,
        )
      : entity

export const $Reducer = { compose }
