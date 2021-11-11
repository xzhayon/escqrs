import { $AggregateId } from '../../../core/aggregates/Aggregate'
import { $CorrelationId } from '../../../core/messages/Message'
import { Gwt } from '../../../test/Gwt'
import { $FilmId } from '../entities/Film'
import { $ScreenId } from '../entities/Screen'
import { $ScreeningCreated } from '../events/ScreeningCreated'
import { $SeatBookingRequested } from '../events/SeatBookingRequested'
import { $SeatsReserved } from '../events/SeatsReserved'
import { $BookSeats } from './BookSeats'

describe('BookSeats', () => {
  describe('handler', () => {
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const screenId = $ScreenId('screenId')
      const provider = 'PayPal'

      return Gwt.test($BookSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmName: 'filmName',
            screenId,
            screenName: 'screenName',
            date: new Date(),
            seats: { rows: 16, columns: 40 },
          })(),
        )
        .when($BookSeats()({ aggregateId, provider })())
        .then(
          $SeatBookingRequested()({ aggregateId, seatCount: 0, provider })(),
        )
        .run()
    })
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const screenId = $ScreenId('screenId')
      const provider = 'PayPal'

      return Gwt.test($BookSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmName: 'filmName',
            screenId,
            screenName: 'screenName',
            date: new Date(),
            seats: { rows: 16, columns: 40 },
          })(),
          $SeatsReserved()({
            aggregateId,
            seats: [
              { row: 12, column: 20 },
              { row: 12, column: 21 },
            ],
          })(),
        )
        .when($BookSeats()({ aggregateId, provider })())
        .then(
          $SeatBookingRequested()({ aggregateId, seatCount: 0, provider })(),
        )
        .run()
    })
    it('', async () => {
      const correlationId = $CorrelationId('correlationId')
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const screenId = $ScreenId('screenId')
      const provider = 'PayPal'

      return Gwt.test($BookSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmName: 'filmName',
            screenId,
            screenName: 'screenName',
            date: new Date(),
            seats: { rows: 16, columns: 40 },
          })(),
          $SeatsReserved()(
            {
              aggregateId,
              seats: [
                { row: 12, column: 20 },
                { row: 12, column: 21 },
              ],
            },
            { correlationId },
          )(),
        )
        .when($BookSeats()({ aggregateId, provider }, { correlationId })())
        .then(
          $SeatBookingRequested()({ aggregateId, seatCount: 2, provider })(),
        )
        .run()
    })
  })
})
