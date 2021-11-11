import { Array } from '@effect-ts/core'
import { $Event, Event } from '../../../core/messages/events/Event'
import { Seat } from '../commands/ReserveSeats'

export interface SeatsAlreadyTaken_v0 extends Event<'SeatsAlreadyTaken'> {
  readonly seatsAlreadyTaken: Array.Array<Seat>
}

export function $SeatsAlreadyTaken() {
  return $Event<SeatsAlreadyTaken_v0>('Event.SeatsAlreadyTaken')
}
