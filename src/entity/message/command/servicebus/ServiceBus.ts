import { Effect, Has, pipe } from '@effect-ts/core'
import { $Logger } from '../../../../logger/Logger'
import { Command } from '../Command'
import { CommandHandler } from '../CommandHandler'

const CHANNEL = 'ServiceBus'

export interface ServiceBus {
  readonly dispatch: (command: Command) => Effect.IO<Error, void>
  readonly registerHandler: (handler: CommandHandler) => Effect.IO<Error, void>
}

export const HasServiceBus = Has.tag<ServiceBus>()

const { dispatch: _dispatch } = Effect.deriveLifted(HasServiceBus)(
  ['dispatch'],
  [],
  [],
)
const { registerHandler: _registerHandler } = Effect.deriveAccessM(
  HasServiceBus,
)(['registerHandler'])

const dispatch = (command: Command) =>
  pipe(
    command,
    _dispatch,
    Effect.tapBoth(
      (error) =>
        $Logger.error('Command not dispatched', {
          messageType: command._.type,
          error,
          correlationId: command._.correlationId,
          messageId: command._.id,
          causationId: command._.causationId,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Command dispatched', {
          messageType: command._.type,
          correlationId: command._.correlationId,
          messageId: command._.id,
          causationId: command._.causationId,
          channel: CHANNEL,
        }),
    ),
  )

const registerHandler = (handler: CommandHandler) =>
  pipe(
    _registerHandler((f) => f(handler)),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Command handler not registered', {
          messageType: handler.type,
          error,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Command handler registered', {
          messageType: handler.type,
          channel: CHANNEL,
        }),
    ),
  )

export const $ServiceBus = { dispatch, registerHandler }
