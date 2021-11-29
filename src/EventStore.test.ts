import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { Body } from './Entity'
import { $Event, Event } from './Event'
import { $EventHandler } from './EventHandler'
import { $EventStore } from './EventStore'

describe('EventStore', () => {
  let bar: number

  beforeEach(() => {
    bar = 0
  })

  it('handling an event', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const handler = yield* _(
            $EventHandler(
              'foo',
              'bar',
            )(
              Effect.succeed((event) =>
                Effect.succeedWith(() => {
                  bar += (event as any).bar
                }),
              ),
            ),
          )
          yield* _($EventStore.subscribe(handler))
          const event = yield* _(
            $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
          )
          yield* _($EventStore.run)

          return yield* _($EventStore.publish(event))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ).then(() => bar),
    ).resolves.toBe(42)
  })
  it('subscribing multiple handlers to the same event', async () => {
    await expect(
      pipe(
        gen(function* (_) {
          const handlers = [
            yield* _(
              $EventHandler(
                'foo',
                'bar',
              )(
                Effect.succeed((event) =>
                  Effect.succeedWith(() => {
                    bar += (event as any).bar
                  }),
                ),
              ),
            ),
            yield* _(
              $EventHandler(
                'foo',
                'bar',
              )(
                Effect.succeed((event) =>
                  Effect.succeedWith(() => {
                    bar -= 2 * (event as any).bar
                  }),
                ),
              ),
            ),
          ]
          for (const handler of handlers) {
            yield* _($EventStore.subscribe(handler))
          }
          const event = yield* _(
            $Event('foo')({ aggregateId: 'bar', bar: 42 } as Body<Event>)(),
          )
          yield* _($EventStore.run)

          return yield* _($EventStore.publish(event))
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ).then(() => bar),
    ).resolves.toBe(42 - 42 * 2)
  })
})
