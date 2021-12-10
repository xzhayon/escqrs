import { Effect, pipe } from '@effect-ts/core'
import { $Uuid, HasUuid, Uuid as _Uuid } from '../../src/uuid/Uuid'
import { Uuid } from './Uuid'

export const $Rfc4122Uuid = ({ $uuid }: { $uuid: _Uuid }): Uuid => ({
  v4: () =>
    pipe($Uuid.v4, Effect.provideService(HasUuid)($uuid), Effect.runPromise),
})
