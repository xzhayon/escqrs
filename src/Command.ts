import { Branded } from '@effect-ts/core'
import { Entity, Type } from './Entity'
import { $Message, Message } from './Message'

export interface Command<T extends string = string, A extends Entity = Entity>
  extends Branded.Branded<Message<T, A>, 'Event'> {}

export function $Command<A extends Command>(type: Type<A>) {
  return $Message(type)
}
