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
import { $SeatsFreed } from '../events/SeatsFreed'

export interface FreeSeats extends Command<'FreeSeats'> {}

export function $FreeSeats() {
  return $Command<FreeSeats>('Command.FreeSeats')
}

$FreeSeats.handler = $CommandHandler<FreeSeats>('Command.FreeSeats')(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $uuid: HasUuid,
  })(
    ({ $eventStore, $logger, $uuid }) =>
      (command) =>
        pipe(
          Effect.gen(function* (_) {
            const screening = yield* _(
              $Aggregate.load($Screening.aggregate)(command.aggregateId),
            )
            const event = yield* _(
              $SeatsFreed()({ aggregateId: command.aggregateId })(command),
            )
            yield* _($EventStore.publish(screening._.version)(event))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
