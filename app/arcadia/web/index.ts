import { Effect, pipe } from '@effect-ts/core'
import _fastify from 'fastify'
import { $Layer } from '../../../config/Layer.local'
import { $Effect } from '../../../src/Effect'
import { $CreateScreen } from './command/CreateScreen'
import fastifyCors from 'fastify-cors'

const fastify = _fastify({ logger: true })

fastify.register(fastifyCors)

fastify.addHook('preSerialization', async (_request, _reply, payload) =>
  $Effect.is(payload)
    ? pipe(payload, Effect.provideLayer($Layer), Effect.runPromise)
    : payload,
)

fastify.register($CreateScreen)

const start = async () => {
  try {
    await fastify.listen(process.argv[2] ?? 0)
  } catch (error) {
    fastify.log.error(error)
    throw error
  }
}

start()
