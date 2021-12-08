import { Clock } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'
import { PartialDeep } from '../PartialDeep'
import { $Entity, $EntityC, Body, Entity, Header, Type } from './Entity'

export interface MutableEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends Entity<
    T,
    I,
    H & {
      readonly date: { readonly created: Date; readonly updated: Date }
      readonly version: number
    }
  > {}

export const $MutableEntityC = <
  T extends t.Type<string>,
  I extends t.Type<string>,
  H extends t.Type<{ readonly [K: string]: unknown }>,
>(
  tC: T = t.string as unknown as T,
  iC: I = t.string as unknown as I,
  hC: H = t.type({}) as unknown as H,
  name?: string,
): t.Type<
  MutableEntity<t.TypeOf<T>, t.TypeOf<I>, t.TypeOf<H>>,
  MutableEntity<t.OutputOf<T>, t.OutputOf<I>, t.OutputOf<H>>
> =>
  $EntityC(
    tC,
    iC,
    t.intersection([
      hC,
      t.readonly(
        t.type({
          date: t.readonly(
            t.type({
              created: DateFromISOString,
              updated: DateFromISOString,
            }),
          ),
          version: t.number,
        }),
        'MutableEntityHeader',
      ),
    ]) as t.Mixed,
    name ?? 'MutableEntity',
  )

export function $MutableEntity<A extends MutableEntity>(type: Type<A>) {
  return (body: Body<A>, header?: PartialDeep<Omit<Header<A>, 'type'>>) =>
    gen(function* (_) {
      const created =
        header?.date?.created ?? new Date(yield* _(Clock.currentTime))
      const updated = header?.date?.updated ?? created

      return yield* _(
        $Entity(type)(body, {
          ...header,
          version: header?.version ?? -1,
          date: { created, updated },
        } as PartialDeep<Omit<Header<A>, 'type'>>),
      )
    })
}

$MutableEntity.bump = <A extends MutableEntity>(entity: A) =>
  gen(function* (_) {
    const updated = new Date(yield* _(Clock.currentTime))

    return {
      ...entity,
      _: {
        ...entity._,
        date: { ...entity._.date, updated },
        version: entity._.version + 1,
      },
    } as A
  })
