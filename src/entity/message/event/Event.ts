import { Branded } from '@effect-ts/core'
import * as t from 'io-ts'
import { Entity, Id, Type } from '../../Entity'
import { $Message, $MessageC, Message } from '../Message'

export interface Event<A extends Entity = Entity, T extends string = string>
  extends Branded.Branded<Message<A, T>, 'Event'> {}

export const $EventC = <A extends Entity, T extends t.Type<string>>(
  aC: t.Type<Id<A>, string> = t.string as t.Type<Id<A>, string>,
  tC: T = t.string as unknown as T,
  name?: string,
): t.Type<Event<A, t.TypeOf<T>>, Event<A, t.OutputOf<T>>> =>
  $MessageC(aC, tC, name ?? 'Event') as t.Mixed

export function $Event<A extends Event>(type: Type<A>) {
  return $Message(type)
}
