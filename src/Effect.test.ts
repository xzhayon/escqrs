import { Effect, Has, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import { $Effect } from './Effect'
import { $Logger, HasLogger, Logger } from './logger/Logger'
import { $NilLogger } from './logger/NilLogger'

describe('Effect', () => {
  describe('providedWith', () => {
    test('moving dependencies from an effectful function to the wrapper effect', async () => {
      const f = $Logger.debug
      const _f = await pipe(
        f,
        $Effect.providedWith<Has.Has<Logger>>(),
        Effect.provideService(HasLogger)($NilLogger),
        Effect.runPromise,
      )

      await expect(pipe(_f('foo'), Effect.runPromise)).resolves.toBeUndefined()
    })
  })

  describe('providedWithM', () => {
    test('moving dependencies from an effectful function to the wrapper effect', async () => {
      const f = Effect.succeed($Logger.debug)
      const _f = await pipe(
        f,
        $Effect.providedWithM<Has.Has<Logger>>(),
        Effect.provideService(HasLogger)($NilLogger),
        Effect.runPromise,
      )

      await expect(pipe(_f('foo'), Effect.runPromise)).resolves.toBeUndefined()
    })
  })

  describe('is', () => {
    test.each([
      [undefined, false],
      [false, false],
      [0, false],
      ['', false],
      [[], false],
      [{}, false],
      [Promise.resolve(undefined), false],
      [() => Promise.resolve(undefined), false],
      [Effect.unit, true],
      [gen(function* (_) {}), true],
      [Layer.Empty, false],
    ])('refining value (#%#)', (value, expected) => {
      expect($Effect.is(value)).toBe(expected)
    })
  })
})
