import { $Event, Event } from '../../../../core/messages/events/Event'
import { Money } from '../entities/Money'

export interface PaymentRefunded_v0 extends Event<'PaymentRefunded'> {
  readonly sum: Money
}

export function $PaymentRefunded() {
  return $Event<PaymentRefunded_v0>('Event.PaymentRefunded')
}
