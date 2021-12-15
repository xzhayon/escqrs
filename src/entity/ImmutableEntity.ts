import { Clock } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'
import { DeepPartial } from '../DeepPartial'
import { $Entity, $EntityC, Body, Entity, Header, Type } from './Entity'

export interface ImmutableEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends Entity<T, I, H & { readonly date: Date }> {}

export const $ImmutableEntityC = <
  T extends t.Type<string>,
  I extends t.Type<string>,
  H extends t.Type<{ readonly [K: string]: unknown }>,
>(
  tC: T = t.string as unknown as T,
  iC: I = t.string as unknown as I,
  hC: H = t.type({}) as unknown as H,
  name?: string,
): t.Type<
  ImmutableEntity<t.TypeOf<T>, t.TypeOf<I>, t.TypeOf<H>>,
  ImmutableEntity<t.OutputOf<T>, t.OutputOf<I>, t.OutputOf<H>>
> =>
  $EntityC(
    tC,
    iC,
    t.intersection([
      hC,
      t.readonly(t.type({ date: DateFromISOString }), 'ImmutableEntityHeader'),
    ]) as t.Mixed,
    name ?? 'ImmutableEntity',
  )

export function $ImmutableEntity<A extends ImmutableEntity>(type: Type<A>) {
  return (body: Body<A>, header?: DeepPartial<Omit<Header<A>, 'type'>>) =>
    gen(function* (_) {
      const date = header?.date ?? new Date(yield* _(Clock.currentTime))

      return yield* _(
        $Entity(type)(body, { ...header, date } as DeepPartial<
          Omit<Header<A>, 'type'>
        >),
      )
    })
}
