const fromUnknown = (error: Error) => (u: unknown) =>
  u instanceof Error
    ? u
    : is(u)
    ? Error(u.message)
    : 'string' === typeof u
    ? Error(u)
    : error

const is = (u: unknown): u is Error =>
  u instanceof Error ||
  ('object' === typeof u &&
    null !== u &&
    'name' in u &&
    'string' === typeof (u as any).name &&
    'message' in u &&
    'string' === typeof (u as any).message)

export const $Error = { fromUnknown, is }
