import { Branded } from '@effect-ts/core'
import { $Message, Message } from '../Message'

export interface Event<A extends string = string>
  extends Branded.Branded<Message<`Event.${A}`>, 'Event'> {}

export function $Event<A extends Event>(type: A['_']['type']) {
  return $Message(type)
}
