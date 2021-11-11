import { Branded } from '@effect-ts/core'
import { $Message, Message } from '../Message'

export interface Command<A extends string = string>
  extends Branded.Branded<Message<`Command.${A}`>, 'Command'> {}

export function $Command<A extends Command>(type: A['_']['type']) {
  return $Message(type)
}
