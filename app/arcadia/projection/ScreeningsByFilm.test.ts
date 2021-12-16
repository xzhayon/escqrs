import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { $Layer } from '../../../config/Layer.testing'
import { $Film } from '../film/Film'
import { $Screen } from '../screen/Screen'
import { $Screening } from '../screening/Screening'
import { $ScreeningsByFilm } from './ScreeningsByFilm'

describe('ScreeningsByFilm', () => {
  const filmId = $Film.id('filmId')
  const filmTitle = 'filmTitle'
  const screeningId = $Screening.id('screeningId')
  const date = new Date()
  const screenId = $Screen.id('screenId')
  const screenName = 'screenName'
  const seats = 42

  describe('addScreening', () => {
    test('adding new screening', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const projection = yield* _(
              $ScreeningsByFilm()({ filmId, filmTitle, screenings: [] }),
            )

            return $ScreeningsByFilm.addScreening(
              projection,
              screeningId,
              date,
              screenId,
              screenName,
              seats,
            )
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({
        filmId,
        filmTitle,
        screenings: [
          {
            screeningId,
            date,
            screenId,
            screenName,
            seats: { total: seats, free: seats },
          },
        ],
      })
    })
    test('adding duplicate screening', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            const projection = yield* _(
              $ScreeningsByFilm()({
                filmId,
                filmTitle,
                screenings: [
                  {
                    screeningId,
                    date,
                    screenId,
                    screenName,
                    seats: { total: 1337, free: 1138 },
                  },
                ],
              }),
            )

            return $ScreeningsByFilm.addScreening(
              projection,
              screeningId,
              date,
              screenId,
              screenName,
              seats,
            )
          }),
          Effect.provideSomeLayer($Layer),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({
        filmId,
        filmTitle,
        screenings: [
          {
            screeningId,
            date,
            screenId,
            screenName,
            seats: { total: seats, free: seats },
          },
        ],
      })
    })
  })
})
