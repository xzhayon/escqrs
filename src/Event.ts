import { Branded } from '@effect-ts/core'
import { Type } from './Entity'
import { $Message, Message } from './Message'

export interface Event<A extends string = string>
  extends Branded.Branded<Message<A>, 'Event'> {}

export function $Event<A extends Event>(type: Type<A>) {
  return $Message(type)
}
