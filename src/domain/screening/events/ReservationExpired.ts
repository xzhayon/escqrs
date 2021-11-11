import { $Event, Event } from '../../../core/messages/events/Event'

export interface ReservationExpired_v0 extends Event<'ReservationExpired'> {
  readonly timeout: number
}

export function $ReservationExpired() {
  return $Event<ReservationExpired_v0>('Event.ReservationExpired')
}
