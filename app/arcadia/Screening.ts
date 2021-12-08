import { Array, Branded, Clock, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Aggregate } from '../../src/Aggregate'
import { Id } from '../../src/entity/Entity'
import { EventSourcedEntity } from '../../src/entity/message/event/EventSourcedEntity'
import { CreateScreening } from './command/CreateScreening'
import { ReserveSeats } from './command/ReserveSeats'
import { ScreeningExpired } from './error/ScreeningExpired'
import { SeatsOutOfBounds } from './error/SeatsOutOfBounds'
import { $ScreeningCreated, ScreeningCreated } from './event/ScreeningCreated'
import { $SeatsReserved, SeatsReserved } from './event/SeatsReserved'
import { Film } from './Film'
import { Screen } from './Screen'
import { $Seat, Seat, SeatWithState } from './Seat'

export interface Screening
  extends EventSourcedEntity<
    'Screening',
    Branded.Branded<string, 'ScreeningId'>
  > {
  readonly date: Date
  readonly seats: Array.Array<Array.Array<SeatWithState>>
}

const aggregate = $Aggregate<Screening, ScreeningCreated | SeatsReserved>(
  'Screening',
  {
    ScreeningCreated: (_, event) => ({
      date: event.date,
      seats: pipe(
        event.seats.rows,
        Array.makeBy((row) =>
          pipe(
            event.seats.columns,
            Array.makeBy((column) => $Seat(row + 1, column + 1, 'Free')),
          ),
        ),
      ),
    }),
    SeatsReserved: (screening, event) => screening && { ...screening },
  },
)

export const $Screening = {
  ...aggregate,
  create: (
    id: Id<Screening>,
    film: Film,
    screen: Screen,
    date: Date,
    command?: CreateScreening,
  ) =>
    gen(function* (_) {
      return yield* _(
        $Screening.apply(
          yield* _(
            $ScreeningCreated()({ aggregateId: id, date, seats: screen.seats })(
              command,
            ),
          ),
        )(),
      )
    }),
  reserveSeats: (
    screening: Screening,
    seats: Array.Array<Seat>,
    command?: ReserveSeats,
  ) =>
    gen(function* (_) {
      const now = new Date(yield* _(Clock.currentTime))
      if (now >= screening.date) {
        throw ScreeningExpired.build(screening._.id, screening.date)
      }

      seats.forEach((seat) => {
        if (
          seat.row > screening.seats.length ||
          seat.column > screening.seats[0].length
        ) {
          throw SeatsOutOfBounds.build(
            screening._.id,
            {
              rows: screening.seats.length,
              columns: screening.seats[0].length,
            },
            seat,
          )
        }
      })

      return yield* _(
        $Screening.apply(
          yield* _(
            $SeatsReserved()({ aggregateId: screening._.id, seats })(command),
          ),
        )(screening),
      )
    }),
}
