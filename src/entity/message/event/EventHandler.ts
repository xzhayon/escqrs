import { Type } from '../../Entity'
import { $MessageHandler, MessageHandler } from '../MessageHandler'
import { Event } from './Event'

export interface EventHandler<R = unknown, A extends Event = Event>
  extends MessageHandler<R, A> {
  readonly name: string
}

export function $EventHandler<A extends Event>(type: Type<A>, name: string) {
  return <R>(handle: EventHandler<R, A>['handle']) => ({
    ...$MessageHandler(type)(handle as MessageHandler<R, A>['handle']),
    name,
  })
}

$EventHandler.handle = (event: Event) => (handler: EventHandler) =>
  $MessageHandler.handle(event)(handler as unknown as MessageHandler)
