import { $AggregateId, AggregateId } from '../../../core/aggregates/Aggregate'
import { $CorrelationId } from '../../../core/messages/Message'
import { Gwt } from '../../../test/Gwt'
import { $FilmId } from '../entities/Film'
import { $ScreenId } from '../entities/Screen'
import { $ScreeningCreated } from '../events/ScreeningCreated'
import { $SeatsAlreadyTaken } from '../events/SeatsAlreadyTaken'
import { $SeatsBooked } from '../events/SeatsBooked'
import { $SeatsFreed } from '../events/SeatsFreed'
import { $SeatsReserved } from '../events/SeatsReserved'
import { $ReserveSeats } from './ReserveSeats'

const seats = { rows: 16, columns: 40 }
const _ScreeningCreated = (aggregateId: AggregateId) =>
  $ScreeningCreated()({
    aggregateId,
    filmId: $FilmId('filmId'),
    filmName: 'filmName',
    screenId: $ScreenId('screenId'),
    screenName: 'screenName',
    date: new Date(),
    seats,
  })()

describe('ReserveSeats', () => {
  describe('handler', () => {
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')

      return Gwt.test($ReserveSeats.handler)
        .given(
          _ScreeningCreated(aggregateId),
          $SeatsReserved()({
            aggregateId,
            seats: [
              { row: 12, column: 19 },
              { row: 12, column: 20 },
              { row: 12, column: 21 },
            ],
          })(),
        )
        .when(
          $ReserveSeats()({
            aggregateId,
            seats: [
              { row: 12, column: 20 },
              { row: 12, column: 21 },
              { row: 12, column: 22 },
            ],
          })(),
        )
        .then(
          $SeatsAlreadyTaken()({
            aggregateId,
            seatsAlreadyTaken: [
              { row: 12, column: 20 },
              { row: 12, column: 21 },
            ],
          })(),
        )
        .run()
    })
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')

      return Gwt.test($ReserveSeats.handler)
        .given(_ScreeningCreated(aggregateId))
        .when(
          $ReserveSeats()({
            aggregateId,
            seats: [
              { row: 17, column: 20 },
              { row: 17, column: 21 },
            ],
          })(),
        )
        .then(
          Error(
            `Cannot reserve seat "17-20", only ${seats.rows} rows and ${seats.columns} columns available`,
          ),
        )
        .run()
    })
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')
      const seats = [
        { row: 12, column: 20 },
        { row: 12, column: 21 },
      ]

      return Gwt.test($ReserveSeats.handler)
        .given(_ScreeningCreated(aggregateId))
        .when($ReserveSeats()({ aggregateId, seats })())
        .then($SeatsReserved()({ aggregateId, seats })())
        .run()
    })
    it('', async () => {
      const correlationId = $CorrelationId('correlationId')
      const aggregateId = $AggregateId('aggregateId')
      const seats = [
        { row: 12, column: 20 },
        { row: 12, column: 21 },
      ]

      return Gwt.test($ReserveSeats.handler)
        .given(
          _ScreeningCreated(aggregateId),
          $SeatsReserved()({ aggregateId, seats }, { correlationId })(),
          $SeatsFreed()({ aggregateId }, { correlationId })(),
        )
        .when($ReserveSeats()({ aggregateId, seats })())
        .then($SeatsReserved()({ aggregateId, seats })())
        .run()
    })
    it('', async () => {
      const correlationId = $CorrelationId('correlationId')
      const aggregateId = $AggregateId('aggregateId')
      const seats = [
        { row: 12, column: 20 },
        { row: 12, column: 21 },
      ]

      return Gwt.test($ReserveSeats.handler)
        .given(
          _ScreeningCreated(aggregateId),
          $SeatsReserved()({ aggregateId, seats }, { correlationId })(),
          $SeatsBooked()({ aggregateId }, { correlationId })(),
          $SeatsFreed()({ aggregateId }, { correlationId })(),
        )
        .when($ReserveSeats()({ aggregateId, seats })())
        .then($SeatsAlreadyTaken()({ aggregateId, seatsAlreadyTaken: seats })())
        .run()
    })
  })
})
