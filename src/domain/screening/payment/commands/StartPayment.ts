import { Effect, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { $Aggregate } from '../../../../core/aggregates/Aggregate'
import { $Logger, HasLogger } from '../../../../core/Logger'
import { $Command, Command } from '../../../../core/messages/commands/Command'
import { $CommandHandler } from '../../../../core/messages/commands/CommandHandler'
import { HasServiceBus } from '../../../../core/messages/commands/ServiceBus'
import {
  $EventStore,
  HasEventStore,
} from '../../../../core/messages/events/EventStore'
import { HasUuid } from '../../../../core/Uuid'
import { $Money } from '../entities/Money'
import { $Payment } from '../entities/Payment'
import { Provider } from '../entities/Provider'
import { $PaymentAccepted } from '../events/PaymentAccepted'
import { $PaymentStarted } from '../events/PaymentStarted'

const CHANNEL = 'StartPayment'

const SUM = $Money('EUR')(8.5)

export interface StartPayment extends Command<'StartPayment'> {
  // readonly tierId: Tier
  readonly seatCount: number
  readonly provider: Provider
}

export function $StartPayment() {
  return $Command<StartPayment>('Command.StartPayment')
}

$StartPayment.handler = $CommandHandler<StartPayment>('Command.StartPayment')(
  pipe(
    Effect.accessServices({
      $clock: HasClock,
      $eventStore: HasEventStore,
      $logger: HasLogger,
      $serviceBus: HasServiceBus,
      $uuid: HasUuid,
    })(
      ({ $clock, $eventStore, $logger, $serviceBus, $uuid }) =>
        (command) =>
          pipe(
            $Logger.info('Payment started', {
              provider: command.provider,
              sum: {
                currency: SUM.currency,
                sum: SUM.amount.times(command.seatCount).toNumber(),
              },
              channel: CHANNEL,
            }),
            Effect.chain(() =>
              $PaymentStarted()({
                aggregateId: command.aggregateId,
                provider: command.provider,
                sumPerSeat: SUM,
                seatCount: command.seatCount,
              })(command),
            ),
            Effect.tap($EventStore.publish(0)),
            Effect.tap(() =>
              pipe(
                Effect.do,
                Effect.bindAllPar(() => ({
                  payment: $Aggregate.load($Payment.aggregate)(
                    command.aggregateId,
                  ),
                  event: $PaymentAccepted()({
                    aggregateId: command.aggregateId,
                  })(command),
                })),
                Effect.tap(({ payment, event }) =>
                  $EventStore.publish(payment._.version)(event),
                ),
                Effect.delay(5000),
              ),
            ),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasEventStore)($eventStore),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasServiceBus)($serviceBus),
            Effect.provideService(HasUuid)($uuid),
          ),
    ),
  ),
)
