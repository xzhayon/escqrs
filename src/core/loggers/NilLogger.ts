import { Effect } from '@effect-ts/core'
import { Logger } from '../Logger'

export const $NilLogger: Logger = {
  debug: () => Effect.unit,
  info: () => Effect.unit,
  notice: () => Effect.unit,
  warning: () => Effect.unit,
  error: () => Effect.unit,
  critical: () => Effect.unit,
  alert: () => Effect.unit,
  emergency: () => Effect.unit,
}
