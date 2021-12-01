import { Branded } from '@effect-ts/core'
import { Entity } from '../src.bak/core/entities/Entity'
import { Type } from './Entity'
import { $Message, Message } from './Message'

export interface Event<T extends string = string, A extends Entity = Entity>
  extends Branded.Branded<Message<T, A>, 'Event'> {}

export function $Event<A extends Event>(type: Type<A>) {
  return $Message(type)
}
