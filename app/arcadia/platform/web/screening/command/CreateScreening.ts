import { gen } from '@effect-ts/core/Effect'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'
import { $ServiceBus } from '../../../../../../src/entity/message/command/servicebus/ServiceBus'
import { $Http } from '../../../../../../src/http/Http'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import { $Film } from '../../../../film/Film'
import { $Screen } from '../../../../screen/Screen'
import { $CreateScreening } from '../../../../screening/command/CreateScreening'
import { $Screening } from '../../../../screening/Screening'

export const CreateScreening = $HttpServer.post(
  '/api/v1/screenings/:id/create',
  {
    body: t.type({
      data: t.type({
        filmId: t.string,
        screenId: t.string,
        date: DateFromISOString,
      }),
    }),
    params: t.type({ id: t.string }),
    response: t.void,
  },
  (request) =>
    gen(function* (_) {
      const command = yield* _(
        $CreateScreening()({
          aggregateId: $Screening.id(request.params.id),
          filmId: $Film.id(request.body.data.filmId),
          screenId: $Screen.id(request.body.data.screenId),
          date: request.body.data.date,
        })(),
      )
      yield* _($ServiceBus.dispatch(command))

      return $Http.Accepted()
    }),
)
