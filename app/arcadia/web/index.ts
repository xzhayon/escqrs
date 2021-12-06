import { Effect, pipe } from '@effect-ts/core'
import _fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { $Layer } from '../../../config/Layer.local'
import { $Effect } from '../../../src/Effect'
import { $CreateFilm } from './command/CreateFilm'
import { $CreateScreen } from './command/CreateScreen'

const fastify = _fastify({ logger: true })

fastify.register(fastifyCors)

fastify.addHook('preSerialization', async (_request, _reply, payload) =>
  $Effect.is(payload)
    ? pipe(payload, Effect.provideLayer($Layer), Effect.runPromise)
    : payload,
)

fastify.register($CreateScreen)
fastify.register($CreateFilm)

const start = async () => {
  try {
    await fastify.listen(process.argv[2] ?? 0)
  } catch (error) {
    fastify.log.error(error)
    throw error
  }
}

start()
