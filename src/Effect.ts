import { Array, Effect, pipe } from '@effect-ts/core'
import { flow } from '@effect-ts/core/Function'
import { gen, _A, _E, _R, _RIn, _ROut } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'

export type ROf<A extends Effect.Effect<never, unknown, unknown>> = Parameters<
  A[typeof _R]
>[number]

export type EOf<A extends Effect.Effect<never, unknown, unknown>> = ReturnType<
  A[typeof _E]
>

export type AOf<A extends Effect.Effect<never, unknown, unknown>> = ReturnType<
  A[typeof _A]
>

export type RInOf<A extends Layer.Layer<never, unknown, unknown>> = Parameters<
  A[typeof _RIn]
>[number]

export type ROutOf<A extends Layer.Layer<never, unknown, unknown>> = ReturnType<
  A[typeof _ROut]
>

const providedWith =
  <R>() =>
  <Params extends Array.Array<unknown>, _R, E, A>(
    f: (...params: Params) => Effect.Effect<R & _R, E, A>,
  ): Effect.RIO<R, (...params: Params) => Effect.Effect<_R, E, A>> =>
    gen(function* (_) {
      const r = yield* _(Effect.environment<R>())

      return flow(f, Effect.provide(r))
    })

const providedWithM =
  <R>() =>
  <Params extends Array.Array<unknown>, _R, __R, E, _E, A>(
    f: Effect.Effect<
      _R,
      E,
      (...params: Params) => Effect.Effect<R & __R, _E, A>
    >,
  ) =>
    pipe(f, Effect.chain(providedWith<R>()))

const is = (u: unknown): u is Effect.Effect<unknown, unknown, unknown> =>
  u instanceof Effect.Base

export const $Effect = { providedWith, providedWithM, is }
