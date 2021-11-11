import { Effect, pipe } from '@effect-ts/core'
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
import { $SeatsBooked } from '../events/SeatsBooked'

export interface ConfirmBooking extends Command<'ConfirmBooking'> {}

export function $ConfirmBooking() {
  return $Command<ConfirmBooking>('Command.ConfirmBooking')
}

$ConfirmBooking.handler = $CommandHandler<ConfirmBooking>(
  'Command.ConfirmBooking',
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
          Effect.bind('screening', () =>
            $Aggregate.load($Screening.aggregate)(command.aggregateId),
          ),
          Effect.bind('event', () =>
            $SeatsBooked()({ aggregateId: command.aggregateId })(command),
          ),
          Effect.tap(({ screening, event }) =>
            $EventStore.publish(screening._.version)(event),
          ),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
