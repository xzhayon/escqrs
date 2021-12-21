import { Effect, Fiber, pipe, Queue, Stream, Take } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'

describe('Stream', () => {
  test('fromIterable', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const stream = Stream.fromIterable([0, 1, 2])

          return yield* _(Stream.runCollect(stream))
        }),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual([0, 1, 2])
  })
  test('fromQueue', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const queue = yield* _(Queue.makeDropping<number>(3))
          const stream = Stream.fromQueue(queue)
          const fiber = yield* _(pipe(stream, Stream.runCollect, Effect.fork))
          for (const i of [0, 1, 2, 3]) {
            yield* _(Effect.sleep(1))
            yield* _(Queue.offer_(queue, i))
          }
          yield* _(Queue.shutdown(queue))
          yield* _(Queue.awaitShutdown(queue))

          return yield* _(Fiber.join(fiber))
        }),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual([0, 1, 2, 3])
  })
  test('fromQueueWithShutdown', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const queue = yield* _(Queue.makeDropping<number>(3))
          const fiber = yield* _(
            pipe(
              queue,
              Stream.fromQueueWithShutdown,
              Stream.take(4),
              Stream.runCollect,
              Effect.fork,
            ),
          )
          for (const i of [0, 1, 2, 3, 4]) {
            yield* _(Effect.sleep(1))
            if (!(yield* _(Queue.isShutdown(queue)))) {
              yield* _(Queue.offer_(queue, i))
            }
          }
          yield* _(Queue.awaitShutdown(queue))

          return yield* _(Fiber.join(fiber))
        }),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual([0, 1, 2, 3])
  })
  describe('into', () => {
    test('binding two queues', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const in_ = yield* _(Queue.makeDropping<number>(3))
            const out = yield* _(
              Queue.makeDropping<Take.Take<never, number>>(2),
            )
            yield* _(
              pipe(
                in_,
                Stream.fromQueueWithShutdown,
                Stream.take(5),
                Stream.into(out),
                Effect.fork,
              ),
            )
            const fiber = yield* _(
              pipe(
                out,
                Queue.mapM(Take.done),
                Stream.fromChunkQueueWithShutdown,
                Stream.take(4),
                Stream.runCollect,
                Effect.fork,
              ),
            )
            for (const i of [0, 1, 2, 3, 4, 5]) {
              yield* _(Effect.sleep(1))
              if (!(yield* _(Queue.isShutdown(in_)))) {
                yield* _(Queue.offer_(in_, i))
              }
            }
            yield* _(Queue.awaitShutdown(in_))
            yield* _(Queue.awaitShutdown(out))

            return yield* _(Fiber.join(fiber))
          }),
          Effect.runPromise,
        ),
      ).resolves.toStrictEqual([0, 1, 2, 3])
    })
    test('lazily binding two queues', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const in_ = yield* _(Queue.makeDropping<number>(3))
            const writes: boolean[] = []
            for (const i of [0, 1, 2, 3]) {
              yield* _(Effect.sleep(1))
              if (!(yield* _(Queue.isShutdown(in_)))) {
                writes.push(yield* _(Queue.offer_(in_, i)))
              }
            }
            const out = yield* _(Queue.makeSliding<Take.Take<never, number>>(2))
            yield* _(
              pipe(
                in_,
                Stream.fromQueueWithShutdown,
                Stream.take(6),
                Stream.into(out),
                Effect.fork,
              ),
            )
            for (const i of [4]) {
              yield* _(Effect.sleep(1))
              if (!(yield* _(Queue.isShutdown(in_)))) {
                writes.push(yield* _(Queue.offer_(in_, i)))
              }
            }
            const fiber = yield* _(
              pipe(
                out,
                Queue.mapM(Take.done),
                Stream.fromChunkQueueWithShutdown,
                Stream.take(4),
                Stream.runCollect,
                Effect.fork,
              ),
            )
            for (const i of [5, 6]) {
              yield* _(Effect.sleep(1))
              if (!(yield* _(Queue.isShutdown(in_)))) {
                writes.push(yield* _(Queue.offer_(in_, i)))
              }
            }
            yield* _(Effect.sleep(1))
            yield* _(Queue.shutdown(out))
            yield* _(Queue.awaitShutdown(in_))
            yield* _(Queue.awaitShutdown(out))

            return [writes, yield* _(Fiber.join(fiber))]
          }),
          Effect.runPromise,
        ),
      ).resolves.toStrictEqual([
        [true, true, true, false, true, true],
        [0, 1, 2, 4],
      ])
    })
  })
})
