import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../../../src/entity/message/event/Event'
import { Seat } from '../../Seat'
import { Screening } from '../Screening'

export interface SeatsAlreadyTaken
  extends Event<Screening, 'SeatsAlreadyTaken'> {
  readonly alreadyTakenSeats: Array.Array<Seat>
}

export function $SeatsAlreadyTaken() {
  return $Event<SeatsAlreadyTaken>('SeatsAlreadyTaken')
}
