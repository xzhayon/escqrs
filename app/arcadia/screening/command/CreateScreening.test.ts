import { gen } from '@effect-ts/system/Effect'
import { EntityNotFound } from '../../../../src/entity/repository/EntityNotFound'
import { Gwt } from '../../../../src/Gwt'
import { $Film } from '../../film/Film'
import { $Screen } from '../../screen/Screen'
import { $ScreeningCreated } from '../event/ScreeningCreated'
import { $Screening } from '../Screening'
import { $CreateScreening } from './CreateScreening'

describe('CreateScreening', () => {
  const aggregateId = $Screening.id('screeningId')
  const filmId = $Film.id('filmId')
  const filmTitle = 'filmTitle'
  const date = new Date()
  const screenId = $Screen.id('screenId')
  const screenName = 'screenName'
  const seats = { rows: 16, columns: 40 }

  test('failing because of nonexistent film and screen', async () => {
    await Gwt.test($CreateScreening.handler)
      .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
      .then(EntityNotFound.build('Film', filmId))
      .run()
  })

  describe('film was created', () => {
    test('failing because of nonexistent screen', async () => {
      await Gwt.test($CreateScreening.handler)
        .given(
          gen(function* (_) {
            const film = yield* _($Film()({ title: filmTitle }, { id: filmId }))
            yield* _($Film.save(film))
          }),
        )
        .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
        .then(EntityNotFound.build('Screen', screenId))
        .run()
    })

    describe('screen was created', () => {
      test('creating screening', async () => {
        await Gwt.test($CreateScreening.handler)
          .given(
            gen(function* (_) {
              const film = yield* _(
                $Film()({ title: filmTitle }, { id: filmId }),
              )
              const screen = yield* _(
                $Screen()({ name: screenName, seats }, { id: screenId }),
              )
              yield* _($Film.save(film))
              yield* _($Screen.save(screen))
            }),
          )
          .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
          .then(
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
          .run()
      })
    })
  })
})
