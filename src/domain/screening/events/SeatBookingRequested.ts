import { $Event, Event } from '../../../core/messages/events/Event'

export interface SeatBookingRequested_v0 extends Event<'SeatBookingRequested'> {
  readonly seatCount: number
  readonly provider: 'ApplePay' | 'CreditCard' | 'GooglePay' | 'PayPal'
}

export function $SeatBookingRequested() {
  return $Event<SeatBookingRequested_v0>('Event.SeatBookingRequested')
}
