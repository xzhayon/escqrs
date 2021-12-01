import { Array, Branded, Clock, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Aggregate } from '../../src/Aggregate'
import { EventSourcedEntity } from '../../src/EventSourcedEntity'
import { CreateScreening } from './CreateScreening'
import { Film } from './Film'
import { ReserveSeats } from './ReserveSeats'
import { Screen } from './Screen'
import { $ScreeningCreated, ScreeningCreated } from './ScreeningCreated'
import { ScreeningExpired } from './ScreeningExpired'
import { $Seat, Seat, SeatWithState } from './Seat'
import { SeatsOutOfBounds } from './SeatsOutOfBounds'
import { $SeatsReserved, SeatsReserved } from './SeatsReserved'

export interface Screening
  extends EventSourcedEntity<'Screening', ScreeningId> {
  readonly date: Date
  readonly seats: Array.Array<Array.Array<SeatWithState>>
}

export type ScreeningId = Branded.Branded<string, 'ScreeningId'>

export const $ScreeningId = (id: string): ScreeningId => Branded.makeBranded(id)

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
    id: ScreeningId,
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
