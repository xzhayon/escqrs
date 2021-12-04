import { gen } from '@effect-ts/system/Effect'
import { EntityNotFound } from '../../src/EntityNotFound'
import { Gwt } from '../../src/Gwt'
import { $Repository } from '../../src/Repository'
import { $CreateScreening } from './CreateScreening'
import { $Film, Film } from './Film'
import { $Screen, Screen } from './Screen'
import { $Screening } from './Screening'
import { $ScreeningCreated } from './ScreeningCreated'

describe('CreateScreening', () => {
  const aggregateId = $Screening.id('screeningId')
  const filmId = $Film.id('filmId')
  const screenId = $Screen.id('screenId')
  const seats = { rows: 16, columns: 40 }
  const date = new Date()

  it('failing because of nonexistent film and screen', async () => {
    await Gwt.test($CreateScreening.handler)
      .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
      .then(EntityNotFound.build('Film', filmId))
      .run()
  })

  describe('film was created', () => {
    it('failing because of nonexistent screen', async () => {
      await Gwt.test($CreateScreening.handler)
        .given(
          gen(function* (_) {
            const film = yield* _($Film()({ title: 'foo' }, { id: filmId }))
            yield* _($Repository.insert<Film>(film))
          }),
        )
        .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
        .then(EntityNotFound.build('Screen', screenId))
        .run()
    })

    describe('screen was created', () => {
      it('creating screening', async () => {
        await Gwt.test($CreateScreening.handler)
          .given(
            gen(function* (_) {
              const film = yield* _($Film()({ title: 'foo' }, { id: filmId }))
              const screen = yield* _(
                $Screen()({ name: 'bar', seats }, { id: screenId }),
              )
              yield* _($Repository.insert<Film>(film))
              yield* _($Repository.insert<Screen>(screen))
            }),
          )
          .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
          .then($ScreeningCreated()({ aggregateId, date, seats })())
          .run()
      })
    })
  })
})
