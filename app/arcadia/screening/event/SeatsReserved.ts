import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../../../src/entity/message/event/Event'
import { Seat } from '../../Seat'
import { Screening } from '../Screening'

export interface SeatsReserved extends Event<Screening, 'SeatsReserved'> {
  readonly seats: Array.Array<Seat>
}

export function $SeatsReserved() {
  return $Event<SeatsReserved>('SeatsReserved')
}
