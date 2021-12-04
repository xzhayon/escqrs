import { $Rfc4122 } from '../src/Rfc4122'
import { $HttpArcadiaClient } from './HttpArcadiaClient'
import { $Rfc4122UuidService } from './Rfc4122UuidService'

export type Context = typeof $Context

export const $Context = {
  arcadiaClient: $HttpArcadiaClient(
    process.env.ARCADIA_URL || window.location.origin,
  ),
  uuidService: $Rfc4122UuidService({ $uuid: $Rfc4122 }),
}
