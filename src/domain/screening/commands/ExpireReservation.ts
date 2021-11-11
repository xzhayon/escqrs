import { Effect, pipe } from '@effect-ts/core'
import { $Aggregate } from '../../../core/aggregates/Aggregate'
import { HasLogger } from '../../../core/Logger'
import { $Command, Command } from '../../../core/messages/commands/Command'
import { $CommandHandler } from '../../../core/messages/commands/CommandHandler'
import {
  $EventStore,
  HasEventStore,
} from '../../../core/messages/events/EventStore'
import { $Saga } from '../../../core/sagas/Saga'
import { HasUuid } from '../../../core/Uuid'
import { $SeatBooking } from '../../sagas/SeatBooking'
import { $Screening } from '../entities/Screening'
import { $ReservationExpired } from '../events/ReservationExpired'

export interface ExpireReservation extends Command<'ExpireReservation'> {
  readonly timeout: number
}

export function $ExpireReservation() {
  return $Command<ExpireReservation>('Command.ExpireReservation')
}

$ExpireReservation.handler = $CommandHandler<ExpireReservation>(
  'Command.ExpireReservation',
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
          Effect.bindAllPar(() => ({
            screening: $Aggregate.load($Screening.aggregate)(
              command.aggregateId,
            ),
            saga: $Saga.load($SeatBooking.aggregate)(command._.correlationId),
          })),
          Effect.tap(({ screening, saga }) =>
            'Done' !== saga.paymentState
              ? pipe(
                  command,
                  $ReservationExpired()({
                    aggregateId: command.aggregateId,
                    timeout: command.timeout,
                  }),
                  Effect.chain($EventStore.publish(screening._.version)),
                )
              : Effect.unit,
          ),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
