import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../src/Event'
import { Screening } from './Screening'
import { Seat } from './Seat'

export interface SeatsReserved extends Event<Screening, 'SeatsReserved'> {
  readonly seats: Array.Array<Seat>
}

export function $SeatsReserved() {
  return $Event<SeatsReserved>('SeatsReserved')
}
