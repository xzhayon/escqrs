import { Type } from '../../Entity'
import { $MessageHandler, MessageHandler } from '../MessageHandler'
import { Command } from './Command'

export interface CommandHandler<R = unknown, A extends Command = Command>
  extends MessageHandler<R, A> {}

export function $CommandHandler<A extends Command>(type: Type<A>) {
  return <R>(handle: CommandHandler<R, A>['handle']) =>
    $MessageHandler(type)(handle as MessageHandler<R, A>['handle'])
}

$CommandHandler.handle = (command: Command) => (handler: CommandHandler) =>
  $MessageHandler.handle(command)(handler as MessageHandler)
