import { Branded } from '@effect-ts/core'
import { Entity } from '../src.bak/core/entities/Entity'
import { Type } from './Entity'
import { $Message, Message } from './Message'

export interface Event<A extends Entity = Entity, T extends string = string>
  extends Branded.Branded<Message<A, T>, 'Event'> {}

export function $Event<A extends Event>(type: Type<A>) {
  return $Message(type)
}
