import { EntityNotFound } from '../../../../src/entity/repository/EntityNotFound'
import { Gwt } from '../../../../src/Gwt'
import { $Film } from '../../film/Film'
import { $Screen } from '../../screen/Screen'
import { $Seat } from '../../Seat'
import { ScreeningExpired } from '../error/ScreeningExpired'
import { SeatsOutOfBounds } from '../error/SeatsOutOfBounds'
import { $ScreeningCreated } from '../event/ScreeningCreated'
import { $SeatsAlreadyTaken } from '../event/SeatsAlreadyTaken'
import { $SeatsReserved } from '../event/SeatsReserved'
import { $Screening } from '../Screening'
import { $ReserveSeats } from './ReserveSeats'

describe('ReserveSeats', () => {
  const aggregateId = $Screening.id('screeningId')
  const filmId = $Film.id('filmId')
  const filmTitle = 'filmTitle'
  const date = new Date()
  const screenId = $Screen.id('screenId')
  const screenName = 'screenName'
  const seats = { rows: 16, columns: 40 }
  date.setFullYear(date.getFullYear() + 1)
  const reservedSeats = [$Seat(12, 20), $Seat(12, 21)]

  test('failing because of nonexistent screening', async () => {
    await Gwt.test($ReserveSeats.handler)
      .when($ReserveSeats()({ aggregateId, seats: [] })())
      .then(EntityNotFound.missingEvents('Screening', aggregateId))
      .run()
  })

  describe('screening was created', () => {
    test('failing when screening is expired', async () => {
      const pastDate = new Date(Date.now())

      await Gwt.test($ReserveSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmTitle,
            date: pastDate,
            screenId,
            screenName,
            seats,
          })(),
        )
        .when($ReserveSeats()({ aggregateId, seats: [] })())
        .then(ScreeningExpired.build(aggregateId, pastDate))
        .run()
    })
    test('failing when reserving out-of-bounds seats', async () => {
      const seat = $Seat(17, 41)

      await Gwt.test($ReserveSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmTitle,
            date,
            screenId,
            screenName,
            seats,
          })(),
        )
        .when($ReserveSeats()({ aggregateId, seats: [seat] })())
        .then(SeatsOutOfBounds.build(aggregateId, seats, seat))
        .run()
    })
    test('reserving seats', async () => {
      await Gwt.test($ReserveSeats.handler)
        .given(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmTitle,
            date,
            screenId,
            screenName,
            seats,
          })(),
        )
        .when($ReserveSeats()({ aggregateId, seats: reservedSeats })())
        .then($SeatsReserved()({ aggregateId, seats: reservedSeats })())
        .run()
    })

    describe('seats were reserved', () => {
      test.skip('reserving already taken seats', async () => {
        await Gwt.test($ReserveSeats.handler)
          .given(
            $ScreeningCreated()({
              aggregateId,
              filmId,
              filmTitle,
              date,
              screenId,
              screenName,
              seats,
            })(),
            $SeatsReserved()({ aggregateId, seats: reservedSeats })(),
          )
          .when(
            $ReserveSeats()({
              aggregateId,
              seats: [$Seat(12, 19), $Seat(12, 20), $Seat(12, 21)],
            })(),
          )
          .then(
            $SeatsAlreadyTaken()({
              aggregateId,
              alreadyTakenSeats: [$Seat(12, 20), $Seat(12, 21)],
            })(),
          )
          .run()
      })
    })
  })
})
