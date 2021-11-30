import { Effect, pipe } from '@effect-ts/core'
import { Type } from './Entity'
import { Event } from './Event'
import { $MessageHandler, MessageHandler } from './MessageHandler'

export interface EventHandler<A extends Event = Event>
  extends MessageHandler<A> {
  readonly name: string
}

export function $EventHandler<A extends Event>(type: Type<A>, name: string) {
  return <R>(handle: Effect.RIO<R, EventHandler<A>['handle']>) =>
    pipe(
      $MessageHandler(type)(
        handle as Effect.RIO<R, MessageHandler<A>['handle']>,
      ),
      Effect.map((handler) => ({ ...handler, name } as EventHandler)),
    )
}

$EventHandler.handle = (event: Event) => (handler: EventHandler) =>
  $MessageHandler.handle(event)(handler as unknown as MessageHandler)
