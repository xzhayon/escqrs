import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $Film, Film } from '../../../Film'

export const $RemoveFilm = $HttpServer.delete(
  '/api/v1/films/:id',
  { params: t.type({ id: t.string }), response: t.void },
  (request) =>
    $Repository.delete<Film>({
      _: { type: 'Film', id: $Film.id(request.params.id) },
    }),
)
