import { Effect, pipe } from '@effect-ts/core'
import _fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { $Layer } from '../../../config/Layer.local'
import { $Effect } from '../../../src/Effect'
import { $CreateFilm } from './command/CreateFilm'
import { $CreateScreen } from './command/CreateScreen'
import { $UpdateScreen } from './command/UpdateScreen'
import { $GetFilms } from './query/GetFilms'
import { $GetScreen } from './query/GetScreen'
import { $GetScreens } from './query/GetScreens'

const fastify = _fastify()

fastify.register(fastifyCors)

fastify.addHook('preSerialization', async (_request, _reply, payload) =>
  $Effect.is(payload)
    ? pipe(payload, Effect.provideLayer($Layer), Effect.runPromise)
    : payload,
)

fastify.register($CreateScreen)
fastify.register($GetScreens)
fastify.register($GetScreen)
fastify.register($UpdateScreen)
fastify.register($CreateFilm)
fastify.register($GetFilms)

const start = async () => {
  try {
    await fastify.listen(process.argv[2] ?? 0, '::')
  } catch (error) {
    fastify.log.error(error)
    throw error
  }
}

start()
