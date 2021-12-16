import { Effect, Has, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Effect } from '../../Effect'
import { $Logger } from '../../logger/Logger'
import { $String } from '../../String'
import { HttpMethod, HttpResponse } from '../Http'

const CHANNEL = 'HttpServer'

export interface HttpServer {
  readonly delete: HttpServerRoute
  readonly get: HttpServerRoute
  readonly head: HttpServerRoute
  readonly options: HttpServerRoute
  readonly patch: HttpServerRoute
  readonly post: HttpServerRoute
  readonly put: HttpServerRoute
  readonly run: Effect.IO<Error, void>
}

export interface HttpServerRoute<R = unknown> {
  <
    BodyC extends t.Mixed = t.UnknownC,
    HeadersC extends t.Mixed = t.UnknownC,
    ParamsC extends t.Mixed = t.UnknownC,
    QueryC extends t.Mixed = t.UnknownC,
    ResponseC extends t.Mixed = t.UnknownC,
  >(
    path: string,
    schema: Partial<{
      readonly body: BodyC
      readonly headers: HeadersC
      readonly params: ParamsC
      readonly query: QueryC
      readonly response: ResponseC
    }>,
    handler: HttpServerHandler<R, BodyC, HeadersC, ParamsC, QueryC, ResponseC>,
  ): Effect.Effect<R & Effect.DefaultEnv, Error, void>
}

export const HasHttpServer = Has.tag<HttpServer>()

export interface HttpServerHandler<
  R = unknown,
  BodyC extends t.Mixed = t.UnknownC,
  HeadersC extends t.Mixed = t.UnknownC,
  ParamsC extends t.Mixed = t.UnknownC,
  QueryC extends t.Mixed = t.UnknownC,
  ResponseC extends t.Mixed = t.UnknownC,
> {
  (
    request: HttpServerRequest<
      t.TypeOf<BodyC>,
      t.TypeOf<HeadersC>,
      t.TypeOf<ParamsC>,
      t.TypeOf<QueryC>
    >,
  ): Effect.Effect<
    R & Effect.DefaultEnv,
    Error,
    t.TypeOf<ResponseC> | HttpResponse<t.TypeOf<ResponseC>>
  >
}

export interface HttpServerRequest<
  Body = unknown,
  Headers = unknown,
  Params = unknown,
  Query = unknown,
> {
  readonly body: Body
  readonly headers: Headers
  readonly params: Params
  readonly query: Query
}

const {
  run: _run,
  delete: _delete,
  get,
  head,
  options,
  patch,
  post,
  put,
} = Effect.deriveLifted(HasHttpServer)(
  [],
  [],
  ['run', 'delete', 'get', 'head', 'options', 'patch', 'post', 'put'],
)

const _route =
  (
    method: HttpMethod,
    route: Effect.Effect<Has.Has<HttpServer>, never, HttpServerRoute>,
  ) =>
  <
    R,
    BodyC extends t.Mixed = t.UnknownC,
    HeadersC extends t.Mixed = t.UnknownC,
    ParamsC extends t.Mixed = t.UnknownC,
    QueryC extends t.Mixed = t.UnknownC,
    ResponseC extends t.Mixed = t.UnknownC,
  >(
    path: string,
    schema: Partial<{
      readonly body: BodyC
      readonly headers: HeadersC
      readonly params: ParamsC
      readonly query: QueryC
      readonly response: ResponseC
    }>,
    handler: HttpServerHandler<R, BodyC, HeadersC, ParamsC, QueryC, ResponseC>,
  ) =>
    pipe(
      gen(function* (_) {
        const __route = yield* _(route)
        const _handler = yield* _($Effect.providedWith<R>()(handler))

        return yield* _(__route(path, schema, _handler))
      }),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Route not registered', {
            method: $String.uppercase(method),
            path,
            error,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Route registered', {
            method: $String.uppercase(method),
            path,
            channel: CHANNEL,
          }),
      ),
    )

const run = pipe(
  gen(function* (_) {
    const __run = yield* _(_run)

    return yield* _(__run)
  }),
  Effect.tapBoth(
    (error) =>
      $Logger.error('HTTP server not started', { error, channel: CHANNEL }),
    () => $Logger.info('HTTP server started', { channel: CHANNEL }),
  ),
)

export const $HttpServer = {
  delete: _route('delete', _delete),
  get: _route('get', get),
  head: _route('head', head),
  options: _route('options', options),
  patch: _route('patch', patch),
  post: _route('post', post),
  put: _route('put', put),
  run,
}
