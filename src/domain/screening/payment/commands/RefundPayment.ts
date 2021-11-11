import { Effect, pipe } from '@effect-ts/core'
import { Big } from 'big.js'
import { $Aggregate } from '../../../../core/aggregates/Aggregate'
import { HasLogger } from '../../../../core/Logger'
import { $Command, Command } from '../../../../core/messages/commands/Command'
import { $CommandHandler } from '../../../../core/messages/commands/CommandHandler'
import {
  $EventStore,
  HasEventStore,
} from '../../../../core/messages/events/EventStore'
import { HasUuid } from '../../../../core/Uuid'
import { $Money } from '../entities/Money'
import { $Payment } from '../entities/Payment'
import { $PaymentRefunded } from '../events/PaymentRefunded'

export interface RefundPayment extends Command<'RefundPayment'> {}

export function $RefundPayment() {
  return $Command<RefundPayment>('Command.RefundPayment')
}

$RefundPayment.handler = $CommandHandler<RefundPayment>(
  'Command.RefundPayment',
)(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $uuid: HasUuid,
  })(
    ({ $eventStore, $logger, $uuid }) =>
      (command) =>
        pipe(
          Effect.do,
          Effect.bind('payment', () =>
            $Aggregate.load($Payment.aggregate)(command.aggregateId),
          ),
          Effect.bind('event', ({ payment }) =>
            $PaymentRefunded()({
              aggregateId: command.aggregateId,
              sum: $Money(payment.sumPerSeat.currency)(
                Big(payment.sumPerSeat.amount).times(payment.seatCount),
              ),
            })(command),
          ),
          Effect.tap(({ payment, event }) =>
            $EventStore.publish(payment._.version)(event),
          ),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
