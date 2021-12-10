import { LiveClock } from '@effect-ts/system/Clock'
import axios from 'axios'
import { $AxiosHttpClient } from '../src/http/client/AxiosHttpClient'
import { $NilLogger } from '../src/logger/NilLogger'
import { $Rfc4122Uuid as _$Rfc4122Uuid } from '../src/uuid/Rfc4122Uuid'
import { $HttpArcadiaClient } from './HttpArcadiaClient'
import { $Rfc4122Uuid } from './uuid/Rfc4122Uuid'

export type Context = typeof $Context

export const $Context = {
  arcadiaClient: $HttpArcadiaClient({
    $clock: new LiveClock(),
    $http: $AxiosHttpClient(axios),
    $logger: $NilLogger,
  })(process.env.ARCADIA_URL || window.location.origin),
  uuid: $Rfc4122Uuid({ $uuid: _$Rfc4122Uuid }),
}
