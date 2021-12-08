import { Effect, pipe } from '@effect-ts/core'
import { Type } from '../../Entity'
import { $MessageHandler, MessageHandler } from '../MessageHandler'
import { Command } from './Command'

export interface CommandHandler<A extends Command = Command>
  extends MessageHandler<A> {}

export function $CommandHandler<A extends Command>(type: Type<A>) {
  return <R>(handle: Effect.RIO<R, CommandHandler<A>['handle']>) =>
    pipe(
      $MessageHandler(type)(
        handle as Effect.RIO<R, MessageHandler<A>['handle']>,
      ),
      Effect.map((handler) => handler as CommandHandler),
    )
}

$CommandHandler.handle = (command: Command) => (handler: CommandHandler) =>
  $MessageHandler.handle(command)(handler as MessageHandler)
