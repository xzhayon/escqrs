import { $Event, Event } from '../../../../core/messages/events/Event'
import { Money } from '../entities/Money'
import { Provider } from '../entities/Provider'

export interface PaymentStarted_v0 extends Event<'PaymentStarted'> {
  readonly provider: Provider
  readonly sumPerSeat: Money
  readonly seatCount: number
}

export function $PaymentStarted() {
  return $Event<PaymentStarted_v0>('Event.PaymentStarted')
}
