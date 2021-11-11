import { $Event, Event } from '../../../core/messages/events/Event'

export interface SeatsBooked_v0 extends Event<'SeatsBooked'> {}

export function $SeatsBooked() {
  return $Event<SeatsBooked_v0>('Event.SeatsBooked')
}
