import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Aggregate } from '../../src/Aggregate'
import { $Command, Command } from '../../src/Command'
import { $CommandHandler } from '../../src/CommandHandler'
import { HasEventStore } from '../../src/EventStore'
import { HasLogger } from '../../src/Logger'
import { HasRepository } from '../../src/Repository'
import { HasUuid } from '../../src/Uuid'
import { $Screening, ScreeningId } from './Screening'
import { Seat } from './Seat'

export interface ReserveSeats extends Command<'ReserveSeats', ScreeningId> {
  readonly seats: Array.Array<Seat>
}

export function $ReserveSeats() {
  return $Command<ReserveSeats>('ReserveSeats')
}

$ReserveSeats.handler = $CommandHandler<ReserveSeats>('ReserveSeats')(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $repository: HasRepository,
    $uuid: HasUuid,
  })(
    ({ $eventStore, $logger, $repository, $uuid }) =>
      (command) =>
        pipe(
          gen(function* (_) {
            const screening = yield* _(
              $Aggregate.load($Screening)(command.aggregateId),
            )
            const _screening = yield* _(
              $Screening.reserveSeats(screening, command.seats, command),
            )
            yield* _($Aggregate.save($Screening)(_screening))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
