import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../src/Event'
import { ScreeningId } from './Screening'
import { Seat } from './Seat'

export interface SeatsAlreadyTaken
  extends Event<'SeatsAlreadyTaken', ScreeningId> {
  readonly alreadyTakenSeats: Array.Array<Seat>
}

export function $SeatsAlreadyTaken() {
  return $Event<SeatsAlreadyTaken>('SeatsAlreadyTaken')
}
