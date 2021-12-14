import { Either } from '@effect-ts/core'
import { boolean, either, monoid, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/PathReporter'

const bit = t.union([t.literal(0), t.literal(1)], 'Bit')

const booleanFromBit = new t.Type(
  'BooleanFromBit',
  t.boolean.is,
  (u, c) =>
    pipe(
      u,
      bit.decode,
      either.map((b) => (0 === b ? false : true)),
      either.match(() => t.failure(u, c), t.success),
    ),
  boolean.match(
    () => 0 as const,
    () => 1 as const,
  ),
)

const decode =
  <C extends t.Mixed>(codec: C) =>
  (u: unknown): Either.Either<Error, t.TypeOf<C>> =>
    pipe(
      u,
      codec.decode,
      either.mapLeft(failure),
      either.mapLeft(monoid.concatAll(string.Monoid)),
      either.mapLeft(Error),
      either.matchW(Either.left, Either.right),
    )

export const $Any = { bit, booleanFromBit, decode }
