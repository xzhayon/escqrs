import { Array, Effect, pipe } from '@effect-ts/core'
import { $Aggregate } from '../../../core/aggregates/Aggregate'
import { HasLogger } from '../../../core/Logger'
import { $Command, Command } from '../../../core/messages/commands/Command'
import { $CommandHandler } from '../../../core/messages/commands/CommandHandler'
import {
  $EventStore,
  HasEventStore,
} from '../../../core/messages/events/EventStore'
import { HasUuid } from '../../../core/Uuid'
import { $Screening } from '../entities/Screening'
import { $SeatBookingRequested } from '../events/SeatBookingRequested'

export interface BookSeats extends Command<'BookSeats'> {
  readonly provider: 'ApplePay' | 'CreditCard' | 'GooglePay' | 'PayPal'
}

export function $BookSeats() {
  return $Command<BookSeats>('Command.BookSeats')
}

$BookSeats.handler = $CommandHandler<BookSeats>('Command.BookSeats')(
  pipe(
    Effect.accessServices({
      $eventStore: HasEventStore,
      $logger: HasLogger,
      $uuid: HasUuid,
    })(
      ({ $eventStore, $logger, $uuid }) =>
        (command) =>
          pipe(
            Effect.do,
            Effect.bind('screening', () =>
              $Aggregate.load($Screening.aggregate)(command.aggregateId),
            ),
            Effect.bind('event', ({ screening }) =>
              $SeatBookingRequested()({
                aggregateId: command.aggregateId,
                seatCount: pipe(
                  screening.seats,
                  Array.flatten,
                  Array.filter(
                    (seat) =>
                      'Reserved' === seat.state &&
                      command._.correlationId === seat.correlationId,
                  ),
                ).length,
                provider: command.provider,
              })(command),
            ),
            Effect.tap(({ screening, event }) =>
              $EventStore.publish(screening._.version)(event),
            ),
            Effect.provideService(HasEventStore)($eventStore),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasUuid)($uuid),
          ),
    ),
  ),
)
