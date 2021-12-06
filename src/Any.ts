import { Either } from '@effect-ts/core'
import { either, monoid, string } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/PathReporter'

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

export const $Any = { decode }
