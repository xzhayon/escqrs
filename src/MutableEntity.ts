import { Clock } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Entity, Body, Entity, Header, Type } from './Entity'
import { PartialDeep } from './PartialDeep'

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
