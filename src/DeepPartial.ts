export type DeepPartial<A> = A extends { readonly [K: string]: unknown }
  ? Partial<{ readonly [K in keyof A]: DeepPartial<A[K]> }>
  : A
