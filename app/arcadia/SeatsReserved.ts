import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../src/Event'
import { ScreeningId } from './Screening'
import { Seat } from './Seat'

export interface SeatsReserved extends Event<'SeatsReserved', ScreeningId> {
  readonly seats: Array.Array<Seat>
}

export function $SeatsReserved() {
  return $Event<SeatsReserved>('SeatsReserved')
}
