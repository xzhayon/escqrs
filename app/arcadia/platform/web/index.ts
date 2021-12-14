import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import { $Layer } from '../../../../config/Layer.local'
import { $ServiceBus } from '../../../../src/entity/message/command/servicebus/ServiceBus'
import { $EventStore } from '../../../../src/entity/message/event/eventstore/EventStore'
import { $HttpServer } from '../../../../src/http/server/HttpServer'
import { $CreateFilm } from '../../film/message/command/CreateFilm'
import { $EditFilm } from '../../film/message/command/EditFilm'
import { $RemoveFilm } from '../../film/message/command/RemoveFilm'
import { $CreateScreening } from '../../screening/command/CreateScreening'
import { CreateFilm } from './film/command/CreateFilm'
import { EditFilm } from './film/command/EditFilm'
import { RemoveFilm } from './film/command/RemoveFilm'
import { GetFilm } from './film/query/GetFilm'
import { GetFilms } from './film/query/GetFilms'
import { CreateScreen } from './screen/command/CreateScreen'
import { EditScreen } from './screen/command/EditScreen'
import { RemoveScreen } from './screen/command/RemoveScreen'
import { GetScreen } from './screen/query/GetScreen'
import { GetScreens } from './screen/query/GetScreens'
import { CreateScreening } from './screening/command/CreateScreening'
import { GetScreenings } from './screening/query/GetScreenings'

const handlers = [
  [CreateFilm, $CreateFilm] as const,
  [EditFilm, $EditFilm] as const,
  [RemoveFilm, $RemoveFilm] as const,
  [CreateScreening, $CreateScreening] as const,
]

pipe(
  gen(function* (_) {
    for (const [routeHandler, commandHandler] of handlers) {
      yield* _($ServiceBus.registerHandler(yield* _(commandHandler.handler)))
      yield* _(routeHandler)
    }

    yield* _(GetFilms)
    yield* _(GetFilm)

    yield* _(CreateScreen)
    yield* _(EditScreen)
    yield* _(RemoveScreen)
    yield* _(GetScreens)
    yield* _(GetScreen)

    yield* _(GetScreenings)

    yield* _($EventStore.run)
    yield* _($ServiceBus.run)
    yield* _($HttpServer.run)
  }),
  Layer.fromRawEffect,
  Layer.using($Layer),
  Layer.launch,
  Effect.runPromise,
)
