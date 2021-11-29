export type PartialDeep<A> = A extends { readonly [x: string]: unknown }
  ? Partial<{ readonly [k in keyof A]: PartialDeep<A[k]> }>
  : A
