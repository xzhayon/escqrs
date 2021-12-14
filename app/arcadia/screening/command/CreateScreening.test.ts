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
  const screenId = $Screen.id('screenId')
  const seats = { rows: 16, columns: 40 }
  const date = new Date()

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
            const film = yield* _($Film()({ title: 'foo' }, { id: filmId }))
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
              const film = yield* _($Film()({ title: 'foo' }, { id: filmId }))
              const screen = yield* _(
                $Screen()({ name: 'bar', seats }, { id: screenId }),
              )
              yield* _($Film.save(film))
              yield* _($Screen.save(screen))
            }),
          )
          .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
          .then($ScreeningCreated()({ aggregateId, date, seats })())
          .run()
      })
    })
  })
})
