import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $ServiceBus } from '../../../../../../src/entity/message/command/servicebus/ServiceBus'
import { $Http } from '../../../../../../src/http/Http'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $Film } from '../../../../film/Film'
import { $EditFilm } from '../../../../film/message/command/EditFilm'

export const EditFilm = $HttpServer.post(
  '/api/v1/films/:id/edit',
  {
    body: t.type({ data: t.partial({ title: t.string }) }),
    params: t.type({ id: t.string }),
    response: t.void,
  },
  (request) =>
    gen(function* (_) {
      const command = yield* _(
        $EditFilm()({
          ...request.body.data,
          aggregateId: $Film.id(request.params.id),
        })(),
      )
      yield* _($ServiceBus.dispatch(command))

      return $Http.Accepted()
    }),
)
