import { Option } from '@effect-ts/core'
import {
  $Aggregate,
  AggregateRoot,
} from '../../../../core/aggregates/Aggregate'
import { Money } from './Money'
import { PaymentStarted_v0 } from '../events/PaymentStarted'
import { Provider } from './Provider'

export interface Payment extends AggregateRoot<'Payment'> {
  readonly provider: Provider
  readonly sumPerSeat: Money
  readonly seatCount: number
}

const aggregate = $Aggregate<Payment, PaymentStarted_v0>('Aggregate.Payment', {
  'Event.PaymentStarted': (event) =>
    Option.some({
      provider: event.provider,
      sumPerSeat: event.sumPerSeat,
      seatCount: event.seatCount,
    }),
})

export const $Payment = { aggregate }
