import { Array, Effect, NonEmptyArray, Option, pipe } from '@effect-ts/core'
import { $Aggregate } from '../../../core/aggregates/Aggregate'
import { $Error } from '../../../core/Error'
import { HasLogger } from '../../../core/Logger'
import { $Command, Command } from '../../../core/messages/commands/Command'
import { $CommandHandler } from '../../../core/messages/commands/CommandHandler'
import {
  $EventStore,
  HasEventStore,
} from '../../../core/messages/events/EventStore'
import { HasUuid } from '../../../core/Uuid'
import { $Screening } from '../entities/Screening'
import {
  $SeatsAlreadyTaken,
  SeatsAlreadyTaken_v0,
} from '../events/SeatsAlreadyTaken'
import { $SeatsReserved, SeatsReserved_v0 } from '../events/SeatsReserved'

export interface ReserveSeats extends Command<'ReserveSeats'> {
  readonly seats: Array.Array<Seat>
}

export interface Seat {
  readonly row: number
  readonly column: number
}

export function $ReserveSeats() {
  return $Command<ReserveSeats>('Command.ReserveSeats')
}

$ReserveSeats.handler = $CommandHandler<ReserveSeats>('Command.ReserveSeats')(
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
          Effect.tap(({ screening }) =>
            Effect.tryCatch(
              () =>
                command.seats.forEach(({ row, column }) => {
                  if (
                    row > screening.seats.length ||
                    column > screening.seats[0].length
                  ) {
                    throw Error(
                      `Cannot reserve seat "${row}-${column}", only ${screening.seats.length} rows and ${screening.seats[0].length} columns available`,
                    )
                  }
                }),
              $Error.fromUnknown(
                Error('Cannot reserve seats, invalid seats selected'),
              ),
            ),
          ),
          Effect.bind('event', ({ screening }) =>
            pipe(
              command.seats,
              Array.reduce(
                Array.emptyOf<Seat>(),
                (seatsAlreadyTaken, seatToReserve) =>
                  'Free' !==
                  screening.seats[seatToReserve.row - 1][
                    seatToReserve.column - 1
                  ].state
                    ? [...seatsAlreadyTaken, seatToReserve]
                    : seatsAlreadyTaken,
              ),
              NonEmptyArray.fromArray,
              Option.fold(
                () =>
                  $SeatsReserved()({
                    aggregateId: command.aggregateId,
                    seats: command.seats,
                  })(command),
                (seatsAlreadyTaken) =>
                  $SeatsAlreadyTaken()({
                    aggregateId: command.aggregateId,
                    seatsAlreadyTaken,
                  })(command),
              ),
              Effect.map(
                (event: SeatsReserved_v0 | SeatsAlreadyTaken_v0) => event,
              ),
            ),
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
