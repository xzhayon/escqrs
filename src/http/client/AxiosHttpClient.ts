import { Effect, pipe } from '@effect-ts/core'
import { AxiosResponse, AxiosStatic } from 'axios'
import { $Error } from '../../Error'
import { $String } from '../../String'
import { HttpMethod } from '../Http'
import { HttpClient, HttpClientOptions, HttpClientResponse } from './HttpClient'

const request = (
  axios: AxiosStatic,
  method: HttpMethod,
  url: string,
  options: HttpClientOptions = {},
) =>
  pipe(
    Effect.tryCatchPromise(
      () =>
        axios.request({
          data: options.body,
          headers: {
            ...options.headers,
            ...(options.json ? { 'Content-Type': 'application/json' } : null),
          },
          method,
          params: options.query,
          ...(options.json
            ? { responseType: 'json' }
            : options.buffer
            ? { responseType: 'arraybuffer' }
            : null),
          url,
        }),
      $Error.fromUnknown(
        Error(`Cannot make HTTP request "${$String.uppercase(method)} ${url}"`),
      ),
    ),
    Effect.map(response(url)),
  )

const response =
  (url: string) =>
  (response: AxiosResponse): HttpClientResponse => ({
    url: response.config.url || url,
    status: response.status,
    headers: {},
    body: response.data,
  })

export const $AxiosHttpClient = (axios: AxiosStatic): HttpClient => ({
  delete: (url, options) => request(axios, 'delete', url, options),
  get: (url, options) => request(axios, 'get', url, options),
  head: (url, options) => request(axios, 'head', url, options),
  options: (url, options) => request(axios, 'options', url, options),
  patch: (url, options) => request(axios, 'patch', url, options),
  post: (url, options) => request(axios, 'post', url, options),
  put: (url, options) => request(axios, 'put', url, options),
})
