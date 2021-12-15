import { gen } from '@effect-ts/core/Effect'
import * as t from 'io-ts'
import { $ServiceBus } from '../../../../../../src/entity/message/command/servicebus/ServiceBus'
import { $Http } from '../../../../../../src/http/Http'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $Film } from '../../../../film/Film'
import { $RemoveFilm } from '../../../../film/message/command/RemoveFilm'

export const RemoveFilm = $HttpServer.post(
  '/api/v1/films/:id/remove',
  { params: t.type({ id: t.string }), response: t.void },
  (request) =>
    gen(function* (_) {
      const command = yield* _(
        $RemoveFilm()({ aggregateId: $Film.id(request.params.id) })(),
      )
      yield* _($ServiceBus.dispatch(command))

      return $Http.Accepted()
    }),
)
