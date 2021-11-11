import { $Event, Event } from '../../../../core/messages/events/Event'

export interface PaymentAccepted_v0 extends Event<'PaymentAccepted'> {}

export function $PaymentAccepted() {
  return $Event<PaymentAccepted_v0>('Event.PaymentAccepted')
}
