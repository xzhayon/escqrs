import { Effect, pipe } from '@effect-ts/core'
import { $Uuid, HasUuid, Uuid } from '../src/uuid/Uuid'
import { UuidService } from './UuidService'

export const $Rfc4122UuidService = ({
  $uuid,
}: {
  $uuid: Uuid
}): UuidService => ({
  v4: () =>
    pipe($Uuid.v4, Effect.provideService(HasUuid)($uuid), Effect.runPromise),
})
