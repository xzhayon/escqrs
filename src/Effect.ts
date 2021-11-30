import { Effect } from '@effect-ts/core'
import { _A, _E, _R, _RIn, _ROut } from '@effect-ts/system/Effect'
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
