import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $Film, Film } from '../../../Film'
import { $Fastify } from '../../Fastify'

export const $RemoveFilm = $Fastify.delete(
  '/api/v1/films/:id',
  { params: t.type({ id: t.string }), response: t.void },
  async (request) =>
    $Repository.delete<Film>({
      _: { type: 'Film', id: $Film.id(request.params.id) },
    }),
)
