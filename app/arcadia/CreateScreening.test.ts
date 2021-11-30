import { gen } from '@effect-ts/system/Effect'
import { EntityNotFound } from '../../src/EntityNotFound'
import { Gwt } from '../../src/Gwt'
import { $Repository } from '../../src/Repository'
import { $CreateScreening } from './CreateScreening'
import { $Film, $FilmId, Film } from './Film'
import { $Screen, $ScreenId, Screen } from './Screen'
import { $ScreeningId } from './Screening'
import { $ScreeningCreated } from './ScreeningCreated'

describe('CreateScreening', () => {
  const aggregateId = $ScreeningId('screeningId')
  const filmId = $FilmId('filmId')
  const screenId = $ScreenId('screenId')
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
        .prepare(
          gen(function* (_) {
            const film = yield* _($Film()({}, { id: filmId }))
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
          .prepare(
            gen(function* (_) {
              const film = yield* _($Film()({}, { id: filmId }))
              const screen = yield* _($Screen()({ seats }, { id: screenId }))
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
