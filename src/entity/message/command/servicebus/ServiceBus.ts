import { Effect, Has, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { $Effect } from '../../../../Effect'
import { $Logger } from '../../../../logger/Logger'
import { Command } from '../Command'
import { CommandHandler } from '../CommandHandler'

const CHANNEL = 'ServiceBus'

export interface ServiceBus {
  readonly dispatch: (command: Command) => Effect.IO<Error, void>
  readonly registerHandler: (handler: CommandHandler) => Effect.IO<Error, void>
  readonly run: Effect.IO<Error, void>
}

export const HasServiceBus = Has.tag<ServiceBus>()

const {
  dispatch: _dispatch,
  registerHandler: _registerHandler,
  run: _run,
} = Effect.deriveLifted(HasServiceBus)(
  ['dispatch'],
  ['run'],
  ['registerHandler'],
)

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

const registerHandler = <R>({ handle, ...handler }: CommandHandler<R>) =>
  pipe(
    gen(function* (_) {
      const __registerHandler = yield* _(_registerHandler)
      const _handle = yield* _($Effect.providedWith<R>()(handle))
      yield* _(__registerHandler({ ...handler, handle: _handle }))
    }),
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

const run = pipe(
  _run,
  Effect.tapBoth(
    (error) =>
      $Logger.error('Service bus not started', {
        error,
        channel: CHANNEL,
      }),
    () => $Logger.info('Service bus started', { channel: CHANNEL }),
  ),
)

export const $ServiceBus = { dispatch, registerHandler, run }
