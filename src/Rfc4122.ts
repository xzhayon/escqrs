import { Effect } from '@effect-ts/core'
import { v4 } from 'uuid'
import { Uuid } from './Uuid'

export const $Rfc4122: Uuid = {
  v4: Effect.succeedWith(v4),
}
