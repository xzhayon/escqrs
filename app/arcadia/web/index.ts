import { Effect, Managed, pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/system/Layer'
import { $Layer } from '../../../config/Layer.local'
import { $HttpServer } from '../../../src/http/server/HttpServer'
import { $CreateFilm } from './film/command/CreateFilm'
import { $EditFilm } from './film/command/EditFilm'
import { $RemoveFilm } from './film/command/RemoveFilm'
import { $GetFilm } from './film/query/GetFilm'
import { $GetFilms } from './film/query/GetFilms'
import { $CreateScreen } from './screen/command/CreateScreen'
import { $EditScreen } from './screen/command/EditScreen'
import { $RemoveScreen } from './screen/command/RemoveScreen'
import { $GetScreen } from './screen/query/GetScreen'
import { $GetScreens } from './screen/query/GetScreens'

pipe(
  Managed.gen(function* (_) {
    yield* _($CreateScreen)
    yield* _($GetScreens)
    yield* _($GetScreen)
    yield* _($EditScreen)
    yield* _($RemoveScreen)

    yield* _($CreateFilm)
    yield* _($GetFilms)
    yield* _($GetFilm)
    yield* _($EditFilm)
    yield* _($RemoveFilm)

    yield* _($HttpServer.run)
  }),
  Layer.fromRawManaged,
  Layer.using($Layer),
  Layer.launch,
  Effect.runPromise,
)
