import { Effect, Function, Managed, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'
import { FastifyInstance } from 'fastify'
import * as t from 'io-ts'
import { $Any } from '../../Any'
import { $Error } from '../../Error'
import { $Logger, HasLogger } from '../../logger/Logger'
import { HttpMethod } from '../Http'
import { HttpServer, HttpServerHandler, HttpServerRoute } from './HttpServer'

const CHANNEL = 'FastifyHttpServer'

const route =
  (fastify: FastifyInstance, method: HttpMethod): HttpServerRoute =>
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
    Effect.accessM((r: R) =>
      Effect.tryCatch(
        () =>
          fastify.register(async (instance) =>
            instance[method](path, async (request) =>
              pipe(
                gen(function* (_) {
                  request.body = yield* _(
                    $Any.decode(schema.body ?? t.unknown)(request.body),
                  )
                  request.query = yield* _(
                    $Any.decode(schema.query ?? t.unknown)(request.query),
                  )
                  request.params = yield* _(
                    $Any.decode(schema.params ?? t.unknown)(request.params),
                  )
                  yield* _(
                    $Any.decode(schema.headers ?? t.unknown)(request.headers),
                  )

                  return yield* _(handler(request))
                }),
                Effect.provideAll(r),
                Effect.runPromise,
              ),
            ),
          ),
        $Error.fromUnknown(
          Error(`Cannot register route "${method.toUpperCase()} ${path}"`),
        ),
      ),
    )

export const $FastifyHttpServer = (
  fastify: Function.Lazy<FastifyInstance>,
  port = 0,
  address = '::',
) =>
  pipe(
    Effect.tryCatch(
      fastify,
      $Error.fromUnknown(Error('Cannot create Fastify instance')),
    ),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Fastify instance not created', {
          error,
          channel: CHANNEL,
        }),
      () => $Logger.debug('Fastify instance created', { channel: CHANNEL }),
    ),
    Effect.chain((_fastify) =>
      gen(function* (_) {
        const $clock = yield* _(HasClock)
        const $logger = yield* _(HasLogger)

        const server: HttpServer = {
          delete: route(_fastify, 'delete'),
          get: route(_fastify, 'get'),
          head: route(_fastify, 'head'),
          options: route(_fastify, 'options'),
          patch: route(_fastify, 'patch'),
          post: route(_fastify, 'post'),
          put: route(_fastify, 'put'),
          run: pipe(
            Effect.tryCatchPromise(
              () => _fastify.listen(port, address),
              $Error.fromUnknown(Error('Cannot start Fastify HTTP server')),
            ),
            Effect.tapBoth(
              (error) =>
                $Logger.debug('Server not started', {
                  error,
                  channel: CHANNEL,
                }),
              (_address) =>
                $Logger.debug('Server started', {
                  address: _address,
                  channel: CHANNEL,
                }),
            ),
            Effect.asUnit,
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
          ),
        }

        return { server, _fastify }
      }),
    ),
    Managed.make(({ _fastify }) =>
      pipe(
        Effect.tryCatchPromise(
          () => _fastify.close(),
          $Error.fromUnknown(Error('Cannot stop Fastify HTTP server')),
        ),
        Effect.tapBoth(
          (error) =>
            $Logger.warning('Server not stopped', {
              error,
              channel: CHANNEL,
            }),
          () => $Logger.debug('Server stopped', { channel: CHANNEL }),
        ),
        Effect.orElse(() => Effect.unit),
      ),
    ),
    Managed.map(({ server }) => server),
  )
