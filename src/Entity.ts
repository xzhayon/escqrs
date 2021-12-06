import { Branded } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { PartialDeep } from './PartialDeep'
import { $Uuid } from './Uuid'

export interface Entity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> {
  readonly _: H & { readonly type: T; readonly id: I }
}

export const $EntityC = <
  T extends t.Type<string>,
  I extends t.Type<string>,
  H extends t.Type<{ readonly [K: string]: unknown }>,
>(
  tC: T = t.string as unknown as T,
  iC: I = t.string as unknown as I,
  hC: H = t.type({}) as unknown as H,
  name?: string,
): t.Type<
  Entity<t.TypeOf<T>, t.TypeOf<I>, t.TypeOf<H>>,
  Entity<t.OutputOf<T>, t.OutputOf<I>, t.OutputOf<H>>
> =>
  t.readonly(
    t.type({
      _: t.intersection(
        [hC, t.readonly(t.type({ type: tC, id: iC }), 'EntityHeader')],
        'Header',
      ),
    }),
    name ?? 'Entity',
  )

export type Header<A extends Entity> = A['_']
export type Body<A extends Entity> = Omit<A, '_' | keyof Branded.Brand<any>>

export type Meta<A extends Entity, K extends keyof Header<A>> = Header<A>[K]
export type Type<A extends Entity> = Meta<A, 'type'>
export type Id<A extends Entity> = Meta<A, 'id'>

export type Data<A extends Entity, P extends keyof Body<A>> = Body<A>[P]

export function $Entity<A extends Entity>(type: Type<A>) {
  return (body: Body<A>, header?: PartialDeep<Omit<Header<A>, 'type'>>) =>
    gen(function* (_) {
      const id = header?.id ?? (yield* _($Uuid.v4))

      return { ...body, _: { ...header, type, id } } as A
    })
}
