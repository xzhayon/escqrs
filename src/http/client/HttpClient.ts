import { Array, Effect, Has, pipe } from '@effect-ts/core'
import * as Dictionary from '@effect-ts/core/Collections/Immutable/Dictionary'
import { AOf, EOf } from '../../Effect'
import { $Logger } from '../../logger/Logger'
import { HttpMethod } from '../Http'

const CHANNEL = 'HttpClient'

export interface HttpClient {
  readonly delete: HttpClientRequest<'body'>
  readonly get: HttpClientRequest<'body'>
  readonly head: HttpClientRequest<'body'>
  readonly options: HttpClientRequest<'body'>
  readonly patch: HttpClientRequest
  readonly post: HttpClientRequest
  readonly put: HttpClientRequest
}

export const HasHttpClient = Has.tag<HttpClient>()

export interface HttpClientRequest<A extends keyof HttpClientOptions = never> {
  (url: string, options?: Omit<HttpClientOptions, A>): Effect.IO<
    Error,
    HttpClientResponse
  >
}

export interface HttpClientOptions {
  readonly body?: unknown
  readonly buffer?: boolean
  readonly headers?: Dictionary.Dictionary<string>
  readonly json?: boolean
  readonly query?: Dictionary.Dictionary<boolean | number | string>
}

export interface HttpClientResponse<A = unknown> {
  readonly url: string
  readonly status: number
  readonly headers: Dictionary.Dictionary<string | Array.Array<string>>
  readonly body: A
}

const {
  delete: _delete,
  get: _get,
  head: _head,
  options: _options,
  patch: _patch,
  post: _post,
  put: _put,
} = Effect.deriveLifted(HasHttpClient)(
  ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'],
  [],
  [],
)

const request =
  <A extends keyof HttpClientOptions, R>(
    method: HttpMethod,
    _request: (
      ...params: Parameters<HttpClientRequest<A>>
    ) => Effect.Effect<
      R,
      EOf<ReturnType<HttpClientRequest<A>>>,
      AOf<ReturnType<HttpClientRequest<A>>>
    >,
  ) =>
  (url: string, options: Omit<HttpClientOptions, A>) =>
    pipe(
      _request(url, options),
      Effect.tapBoth(
        (error) =>
          $Logger.error('HTTP request failed', {
            method: method.toUpperCase(),
            url,
            error,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('HTTP request succeeded', {
            method: method.toUpperCase(),
            url,
            channel: CHANNEL,
          }),
      ),
    )

export const $HttpClient = {
  delete: request('delete', _delete),
  get: request('get', _get),
  head: request('head', _head),
  options: request('options', _options),
  patch: request('patch', _patch),
  post: request('post', _post),
  put: request('put', _put),
}
