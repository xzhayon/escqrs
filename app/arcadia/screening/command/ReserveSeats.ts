import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import {
  $Command,
  Command,
} from '../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../src/entity/message/command/CommandHandler'
import { HasEventStore } from '../../../../src/entity/message/event/eventstore/EventStore'
import { HasRepository } from '../../../../src/entity/repository/Repository'
import { HasLogger } from '../../../../src/logger/Logger'
import { HasUuid } from '../../../../src/uuid/Uuid'
import { $Screening, Screening } from '../Screening'
import { Seat } from '../../Seat'

export interface ReserveSeats extends Command<Screening, 'ReserveSeats'> {
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
            const screening = yield* _($Screening.load(command.aggregateId))
            const screening_ = yield* _(
              $Screening.reserveSeats(screening, command.seats, command),
            )
            yield* _($Screening.save(screening_))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
