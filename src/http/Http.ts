import { Record } from '@effect-ts/core'

export type HttpMethod = typeof Methods[number]

const Methods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
] as const

export class HttpResponse<A = unknown> {
  constructor(
    readonly status: number,
    readonly body: A,
    readonly headers = {},
  ) {}
}

function Accepted(): HttpResponse<void>
function Accepted<A>(
  body: A,
  headers?: Record.Dictionary<string>,
): HttpResponse<A>
function Accepted<A>(body?: A, headers = {}) {
  return new HttpResponse(202, body, headers)
}

export const $Http = { Methods, Accepted }
