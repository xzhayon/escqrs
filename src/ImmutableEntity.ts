import { Clock } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Entity, Body, Entity, Header, Type } from './Entity'
import { PartialDeep } from './PartialDeep'

export interface ImmutableEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends Entity<T, I, H & { readonly date: Date }> {}

export function $ImmutableEntity<A extends ImmutableEntity>(type: Type<A>) {
  return (body: Body<A>, header?: PartialDeep<Omit<Header<A>, 'type'>>) =>
    gen(function* (_) {
      const date = header?.date ?? new Date(yield* _(Clock.currentTime))

      return yield* _(
        $Entity(type)(body, { ...header, date } as PartialDeep<
          Omit<Header<A>, 'type'>
        >),
      )
    })
}
