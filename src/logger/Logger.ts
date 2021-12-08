import { Array, Clock, Effect, Has, pipe, Record } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'

export interface Logger {
  readonly debug: LogFunction
  readonly info: LogFunction
  readonly notice: LogFunction
  readonly warning: LogFunction
  readonly error: LogFunction
  readonly critical: LogFunction
  readonly alert: LogFunction
  readonly emergency: LogFunction
}

interface LogFunction {
  (message: string, context?: Record.Dictionary<unknown>): Effect.RIO<
    HasClock,
    void
  >
}

export type LogLevel = keyof Logger

export const HasLogger = Has.tag<Logger>()

export const _context = gen(function* (_) {
  return {
    date: new Date(yield* _(Clock.currentTime)),
    appName: process.env.npm_package_name,
    appVersion: process.env.npm_package_version,
  }
})

const levels = [
  'debug',
  'info',
  'notice',
  'warning',
  'error',
  'critical',
  'alert',
  'emergency',
] as const

const level =
  (level: LogLevel) =>
  (logger: Logger): Logger =>
    pipe(
      levels,
      Array.reduce(logger, (_logger, _level) => ({
        ..._logger,
        [_level]:
          levels.indexOf(_level) < levels.indexOf(level)
            ? () => Effect.unit
            : _logger[_level],
      })),
    )

export const $Logger = {
  ...Effect.deriveLifted(HasLogger)(Array.toMutable(levels), [], []),
  level,
}
