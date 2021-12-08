import { Branded } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { PartialDeep } from '../../PartialDeep'
import { $Uuid } from '../../uuid/Uuid'
import { Body, Entity, Header, Id, Type } from '../Entity'
import {
  $ImmutableEntity,
  $ImmutableEntityC,
  ImmutableEntity,
} from '../ImmutableEntity'

export interface Message<A extends Entity = Entity, T extends string = string>
  extends ImmutableEntity<
    T,
    Branded.Branded<string, 'MessageId'>,
    { readonly correlationId: Id<Message>; readonly causationId: Id<Message> }
  > {
  readonly aggregateId: Id<A>
}

export const $MessageC = <A extends Entity, T extends t.Type<string>>(
  aC: t.Type<Id<A>, string> = t.string as t.Type<Id<A>, string>,
  tC: T = t.string as unknown as T,
  name?: string,
): t.Type<Message<A, t.TypeOf<T>>, Message<A, t.OutputOf<T>>> =>
  t.intersection([
    t.readonly(t.type({ aggregateId: aC }), 'Body'),
    $ImmutableEntityC(
      tC,
      t.string,
      t.readonly(
        t.type({ correlationId: t.string, causationId: t.string }),
        'MessageHeader',
      ) as t.Mixed,
      name ?? 'Message',
    ),
  ])

export function $Message<A extends Message>(type: Type<A>) {
  return (body: Body<A>, header?: PartialDeep<Omit<Header<A>, 'type'>>) =>
    <B extends Message>(cause?: B) =>
      gen(function* (_) {
        const id = header?.id ?? $Message.id(yield* _($Uuid.v4))
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

$Message.id = (id: string): Id<Message> => Branded.makeBranded(id)
