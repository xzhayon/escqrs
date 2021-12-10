import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $Screen, Screen } from '../../../Screen'
import { $Fastify } from '../../Fastify'

export const $RemoveScreen = $Fastify.delete(
  '/api/v1/screens/:id',
  {
    params: t.type({ id: t.string }),
    response: t.void,
  },
  async (request) =>
    $Repository.delete<Screen>({
      _: { type: 'Screen', id: $Screen.id(request.params.id) },
    }),
)
