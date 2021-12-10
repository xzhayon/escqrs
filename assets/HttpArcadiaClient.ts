import { Effect, pipe } from '@effect-ts/core'
import { Clock, HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $FilmC } from '../app/arcadia/Film'
import { $ScreenC } from '../app/arcadia/Screen'
import { $Any } from '../src/Any'
import {
  $HttpClient,
  HasHttpClient,
  HttpClient,
} from '../src/http/client/HttpClient'
import { HasLogger, Logger } from '../src/logger/Logger'
import { ArcadiaClient } from './ArcadiaClient'

export const $HttpArcadiaClient =
  ({
    $clock,
    $http,
    $logger,
  }: {
    $clock: Clock
    $http: HttpClient
    $logger: Logger
  }) =>
  (url: string): ArcadiaClient => ({
    createScreen: (screen) =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.post(`${url}/api/v1/screens`, {
              body: { data: screen },
              json: true,
            }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: $ScreenC }))(response.body),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    getScreens: () =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.get(`${url}/api/v1/screens`, { json: true }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: t.readonlyArray($ScreenC) }))(
              response.body,
            ),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    getScreen: (id) =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.get(`${url}/api/v1/screens/${id}`, { json: true }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: $ScreenC }))(response.body),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    editScreen: (screen) =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.patch(`${url}/api/v1/screens/${screen._.id}`, {
              body: { data: screen },
              json: true,
            }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: $ScreenC }))(response.body),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    createFilm: (film) =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.post(`${url}/api/v1/films`, {
              body: { data: film },
              json: true,
            }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: $FilmC }))(response.body),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    getFilms: () =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.get(`${url}/api/v1/films`, { json: true }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: t.readonlyArray($FilmC) }))(
              response.body,
            ),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    getFilm: (id) =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.get(`${url}/api/v1/films/${id}`, { json: true }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: $FilmC }))(response.body),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
    editFilm: (film) =>
      pipe(
        gen(function* (_) {
          const response = yield* _(
            $HttpClient.patch(`${url}/api/v1/films/${film._.id}`, {
              body: { data: film },
              json: true,
            }),
          )
          const body = yield* _(
            $Any.decode(t.type({ data: $FilmC }))(response.body),
          )

          return body.data
        }),
        Effect.provideService(HasClock)($clock),
        Effect.provideService(HasHttpClient)($http),
        Effect.provideService(HasLogger)($logger),
        Effect.runPromise,
      ),
  })
