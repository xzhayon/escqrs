import { Effect, Record } from '@effect-ts/core'
import { pipe } from '@effect-ts/system/Function'
import { $String } from '../String'
import { Logger, LogLevel, _context } from './Logger'

const consoleFunctions: {
  readonly [k in LogLevel]: Extract<
    keyof Console,
    'debug' | 'log' | 'info' | 'warn' | 'error'
  >
} = {
  debug: 'debug',
  info: 'log',
  notice: 'info',
  warning: 'warn',
  error: 'error',
  critical: 'error',
  alert: 'error',
  emergency: 'error',
}

const logFunction =
  <A extends LogLevel>(level: A, plainText: boolean): Logger[A] =>
  (message, context?) =>
    pipe(
      _context,
      Effect.chain(({ date, appName, appVersion }) =>
        Effect.succeedWith(() => {
          const _level = $String.uppercase(level)
          const _context = pipe(
            context ?? {},
            Record.map((value) =>
              value instanceof Error
                ? `${value.name}: ${value.message}`
                : value,
            ),
            Record.filterWithIndex(
              (key, value) =>
                !plainText ||
                (undefined !== value &&
                  !/.+Id$/.test(key) &&
                  'channel' !== key),
            ),
            (_context) => (Record.isEmpty(_context) ? undefined : _context),
          )
          const _message = plainText
            ? `${_level}\t${date.toISOString()} ${
                undefined !== context?.channel ? `[${context.channel}] ` : ''
              }${message}`
            : JSON.stringify({
                level: _level,
                timestamp: date.getTime(),
                message,
                context: _context,
                meta: { appName, appVersion },
              })

          const consoleFunction = console[consoleFunctions[level]]

          return plainText && undefined !== _context
            ? consoleFunction(_message, JSON.stringify(_context))
            : consoleFunction(_message)
        }),
      ),
    )

export const $Console = (plainText = false): Logger => ({
  debug: logFunction('debug', plainText),
  info: logFunction('info', plainText),
  notice: logFunction('notice', plainText),
  warning: logFunction('warning', plainText),
  error: logFunction('error', plainText),
  critical: logFunction('critical', plainText),
  alert: logFunction('alert', plainText),
  emergency: logFunction('emergency', plainText),
})
