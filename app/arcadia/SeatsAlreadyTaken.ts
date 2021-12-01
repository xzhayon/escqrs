import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../src/Event'
import { Screening } from './Screening'
import { Seat } from './Seat'

export interface SeatsAlreadyTaken
  extends Event<Screening, 'SeatsAlreadyTaken'> {
  readonly alreadyTakenSeats: Array.Array<Seat>
}

export function $SeatsAlreadyTaken() {
  return $Event<SeatsAlreadyTaken>('SeatsAlreadyTaken')
}
