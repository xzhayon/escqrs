import { $Event, Event } from '../../../core/messages/events/Event'

export interface SeatsFreed_v0 extends Event<'SeatsFreed'> {}

export function $SeatsFreed() {
  return $Event<SeatsFreed_v0>('Event.SeatsFreed')
}
