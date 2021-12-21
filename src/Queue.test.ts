import { Effect, pipe, Queue } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { InterruptedException } from '@effect-ts/core/Effect/Cause'

describe('Queue', () => {
  test('writing to a shut down queue', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const queue = yield* _(Queue.makeUnbounded<number>())
          yield* _(Queue.shutdown(queue))

          return yield* _(Queue.offer_(queue, 42))
        }),
        Effect.runPromise,
      ),
    ).rejects.toThrow(InterruptedException)
  })
})
