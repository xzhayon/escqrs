import { Effect, pipe } from '@effect-ts/core'
import * as Dictionary from '@effect-ts/core/Collections/Immutable/Dictionary'
import { gen } from '@effect-ts/system/Effect'
import {
  ContextConfigDefault,
  FastifyInstance,
  FastifyPluginAsync,
  HTTPMethods,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RouteHandlerMethod,
} from 'fastify'
import * as t from 'io-ts'
import { $Any } from '../../../src/Any'
import { $Effect } from '../../../src/Effect'

type Methods = Lowercase<HTTPMethods> | 'all'

const METHODS: { readonly [K in Methods]: K } = {
  all: 'all',
  delete: 'delete',
  get: 'get',
  head: 'head',
  options: 'options',
  patch: 'patch',
  post: 'post',
  put: 'put',
}

const route =
  (method: Methods) =>
  <
    BodyC extends t.Mixed = t.UnknownC,
    QuerystringC extends t.Mixed = t.UnknownC,
    ParamsC extends t.Mixed = t.UnknownC,
    HeadersC extends t.Mixed = t.UnknownC,
    ReplyC extends t.Mixed = t.UnknownC,
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    ContextConfig = ContextConfigDefault,
  >(
    path: string,
    schema: Partial<{
      readonly body: BodyC
      readonly querystring: QuerystringC
      readonly params: ParamsC
      readonly headers: HeadersC
      readonly response: ReplyC
    }>,
    handler: RouteHandlerMethod<
      RawServer,
      RawRequest,
      RawReply,
      {
        readonly Body: t.TypeOf<BodyC>
        readonly Querystring: t.TypeOf<QuerystringC>
        readonly Params: t.TypeOf<ParamsC>
        readonly Headers: t.TypeOf<HeadersC>
        readonly Reply:
          | t.TypeOf<ReplyC>
          | Effect.Effect<never, unknown, t.TypeOf<ReplyC>>
      },
      ContextConfig
    >,
  ): FastifyPluginAsync<Record<never, never>, RawServer> =>
  async (instance: FastifyInstance<RawServer, any, any>) => {
    const _handler: typeof handler = async (request, reply) =>
      gen(function* (_) {
        yield* _($Any.decode(schema.body ?? t.unknown)(request.body))
        yield* _($Any.decode(schema.querystring ?? t.unknown)(request.query))
        yield* _($Any.decode(schema.params ?? t.unknown)(request.params))
        yield* _($Any.decode(schema.headers ?? t.unknown)(request.headers))

        const promise = handler.call(instance, request, reply)
        if (undefined !== promise) {
          const valueOrEffect = yield* _(Effect.tryPromise(() => promise))

          return $Effect.is(valueOrEffect)
            ? yield* _(valueOrEffect)
            : valueOrEffect
        }
      })

    instance[method](path, _handler)
  }

export const $Fastify = {
  ...pipe(
    METHODS,
    Dictionary.reduce(
      {} as {
        readonly [K in Methods]: ReturnType<typeof route>
      },
      (plugins, method) => ({ ...plugins, [method]: route(method) }),
    ),
  ),
}
