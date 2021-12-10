import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $Screen, Screen } from '../../../Screen'

export const $RemoveScreen = $HttpServer.delete(
  '/api/v1/screens/:id',
  { params: t.type({ id: t.string }), response: t.void },
  (request) =>
    $Repository.delete<Screen>({
      _: { type: 'Screen', id: $Screen.id(request.params.id) },
    }),
)
