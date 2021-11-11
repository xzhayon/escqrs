const fromUnknown = (error: Error) => (u: unknown) =>
  u instanceof Error ? u : 'string' === typeof u ? Error(u) : error

export const $Error = { fromUnknown }
