import { Branded } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { PartialDeep } from './PartialDeep'
import { $Uuid } from './Uuid'

export interface Entity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> {
  readonly _: H & { readonly type: T; readonly id: I }
}

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
