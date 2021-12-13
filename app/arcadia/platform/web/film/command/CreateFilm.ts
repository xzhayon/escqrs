import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $ServiceBus } from '../../../../../../src/entity/message/command/servicebus/ServiceBus'
import { $Http } from '../../../../../../src/http/Http'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $Film } from '../../../../film/Film'
import { $CreateFilm } from '../../../../film/message/command/CreateFilm'

export const CreateFilm = $HttpServer.post(
  '/api/v1/films',
  {
    body: t.type({
      data: t.strict({ _: t.strict({ id: t.string }), title: t.string }),
    }),
    response: t.void,
  },
  (request) =>
    gen(function* (_) {
      const command = yield* _(
        $CreateFilm()({
          aggregateId: $Film.id(request.body.data._.id),
          title: request.body.data.title,
        })(),
      )
      yield* _($ServiceBus.dispatch(command))

      return $Http.Accepted()
    }),
)
