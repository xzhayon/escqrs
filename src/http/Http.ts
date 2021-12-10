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

export const $Http = { Methods }
