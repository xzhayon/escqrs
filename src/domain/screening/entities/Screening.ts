import { Array, Option, pipe } from '@effect-ts/core'
import { $Aggregate, AggregateRoot } from '../../../core/aggregates/Aggregate'
import { ScreeningCreated_v0 } from '../events/ScreeningCreated'
import { SeatsBooked_v0 } from '../events/SeatsBooked'
import { SeatsFreed_v0 } from '../events/SeatsFreed'
import { SeatsReserved_v0 } from '../events/SeatsReserved'
import { Film } from './Film'
import { Screen } from './Screen'
import { $Seat, Seat } from './Seat'

export interface Screening extends AggregateRoot<'Screening'> {
  readonly film: { readonly id: Film['_']['id']; readonly name: Film['name'] }
  readonly screen: {
    readonly id: Screen['_']['id']
    readonly name: Screen['name']
  }
  readonly date: Date
  readonly seats: Array.Array<Array.Array<Seat>>
}

const aggregate = $Aggregate<
  Screening,
  ScreeningCreated_v0 | SeatsReserved_v0 | SeatsFreed_v0 | SeatsBooked_v0
>('Aggregate.Screening', {
  'Event.ScreeningCreated': ({
    filmId,
    filmName,
    screenId,
    screenName,
    date,
    seats,
  }) =>
    Option.some({
      film: { id: filmId, name: filmName },
      screen: { id: screenId, name: screenName },
      date,
      seats: pipe(
        seats.rows,
        Array.makeBy((row) =>
          pipe(
            seats.columns,
            Array.makeBy((column) => $Seat(row + 1, column + 1, 'Free')),
          ),
        ),
      ),
    }),
  'Event.SeatsReserved': (event, entity) =>
    pipe(
      entity,
      Option.map(({ seats, ...entity }) => ({
        ...entity,
        seats: pipe(
          event.seats,
          Array.reduce(seats, (_seats, _seat) =>
            pipe(
              _seats,
              Array.unsafeUpdateAt(
                _seat.row - 1,
                pipe(
                  _seats[_seat.row - 1],
                  Array.unsafeUpdateAt(
                    _seat.column - 1,
                    $Seat(
                      _seat.row,
                      _seat.column,
                      'Reserved',
                      event._.correlationId,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      })),
    ),
  'Event.SeatsFreed': (event, entity) =>
    pipe(
      entity,
      Option.map(({ seats, ...entity }) => ({
        ...entity,
        seats: pipe(
          seats,
          Array.map(
            Array.map((seat) =>
              'Reserved' === seat.state &&
              event._.correlationId === seat.correlationId
                ? $Seat(seat.row, seat.column, 'Free')
                : seat,
            ),
          ),
        ),
      })),
    ),
  'Event.SeatsBooked': (event, entity) =>
    pipe(
      entity,
      Option.map(({ seats, ...entity }) => ({
        ...entity,
        seats: pipe(
          seats,
          Array.map(
            Array.map((seat) =>
              'Reserved' === seat.state &&
              event._.correlationId === seat.correlationId
                ? $Seat(seat.row, seat.column, 'Booked', seat.correlationId)
                : seat,
            ),
          ),
        ),
      })),
    ),
})

export const $Screening = { aggregate }
