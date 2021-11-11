import { $AggregateId } from '../../../core/aggregates/Aggregate'
import { $CorrelationId } from '../../../core/messages/Message'
import { Gwt } from '../../../test/Gwt'
import { $FilmId } from '../entities/Film'
import { $ScreenId } from '../entities/Screen'
import { $ScreeningCreated } from '../events/ScreeningCreated'
import { $SeatsFreed } from '../events/SeatsFreed'
import { $SeatsReserved } from '../events/SeatsReserved'
import { $FreeSeats } from './FreeSeats'

describe('FreeSeats', () => {
  describe('handler', () => {
    it('', async () => {
      const correlationId = $CorrelationId('correlationId')
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const screenId = $ScreenId('screenId')
      const date = new Date()

      return Gwt.test($FreeSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmName: 'filmName',
            screenId,
            screenName: 'screenName',
            date,
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
        .when($FreeSeats()({ aggregateId }, { correlationId })())
        .then($SeatsFreed()({ aggregateId })())
        .run()
    })
  })
})
