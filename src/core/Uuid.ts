import { Effect, Has } from '@effect-ts/core'

export interface Uuid {
  readonly v4: Effect.UIO<string>
}

export const HasUuid = Has.tag<Uuid>()

export const $Uuid = Effect.deriveLifted(HasUuid)([], ['v4'], [])
