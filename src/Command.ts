import { Branded } from '@effect-ts/core'
import { Entity, Type } from './Entity'
import { $Message, Message } from './Message'

export interface Command<A extends Entity = Entity, T extends string = string>
  extends Branded.Branded<Message<A, T>, 'Event'> {}

export function $Command<A extends Command>(type: Type<A>) {
  return $Message(type)
}
