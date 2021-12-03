import _fastify from 'fastify'

const fastify = _fastify()

fastify.get('/', async () => 'hello, world')

const start = async () => {
  try {
    await fastify.listen(process.argv[2] ?? 0)
  } catch (error) {
    fastify.log.error(error)
    throw error
  }
}

start()
