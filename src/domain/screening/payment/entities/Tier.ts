import { Branded } from '@effect-ts/core'
import { $MutableEntity, MutableEntity } from '../../../../core/entities/Entity'
import { Money } from './Money'

export interface Tier extends MutableEntity<'Tier', TierId> {
  readonly name: string
  readonly sum: Money
}

export type TierId = Branded.Branded<string, 'TierId'>

export const $TierId = (id: string): TierId => Branded.makeBranded(id)

export function $Ticket() {
  return $MutableEntity<Tier>('Tier')
}
