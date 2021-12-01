import { Branded } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { Body, Entity, Header, Id, Type } from './Entity'
import { $ImmutableEntity, ImmutableEntity } from './ImmutableEntity'
import { PartialDeep } from './PartialDeep'
import { $Uuid } from './Uuid'

export interface Message<T extends string = string, A extends Entity = Entity>
  extends ImmutableEntity<
    T,
    MessageId,
    { readonly correlationId: MessageId; readonly causationId: MessageId }
  > {
  readonly aggregateId: Id<A>
}

export type MessageId = Branded.Branded<string, 'MessageId'>

export function $Message<A extends Message>(type: Type<A>) {
  return (body: Body<A>, header?: PartialDeep<Omit<Header<A>, 'type'>>) =>
    <B extends Message>(cause?: B) =>
      gen(function* (_) {
        const id = header?.id ?? $MessageId(yield* _($Uuid.v4))
        const correlationId =
          cause?._.correlationId ?? header?.correlationId ?? id
        const causationId = cause?._.id ?? header?.causationId ?? id

        return yield* _(
          $ImmutableEntity(type)(body, {
            ...header,
            id,
            correlationId,
            causationId,
          } as PartialDeep<Omit<Header<A>, 'type'>>),
        )
      })
}

export const $MessageId = (id: string): MessageId => Branded.makeBranded(id)
