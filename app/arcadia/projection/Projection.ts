import { MutableEntity } from '../../../src/entity/MutableEntity'

export interface Projection<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends MutableEntity<`_Projection.${T}`, I, H> {}
