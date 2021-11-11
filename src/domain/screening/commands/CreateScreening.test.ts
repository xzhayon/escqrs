import { gen } from '@effect-ts/system/Effect'
import { $AggregateId } from '../../../core/aggregates/Aggregate'
import { $Repository } from '../../../core/entities/Repository'
import { Gwt } from '../../../test/Gwt'
import { $Film, $FilmId, Film } from '../entities/Film'
import { $Screen, $ScreenId, Screen } from '../entities/Screen'
import { $ScreeningCreated } from '../events/ScreeningCreated'
import { $CreateScreening } from './CreateScreening'

describe('CreateScreening', () => {
  describe('handler', () => {
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const screenId = $ScreenId('screenId')
      const date = new Date()

      return Gwt.test($CreateScreening.handler)
        .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
        .then(Error(`Cannot find entity "${filmId}" of type "Film"`))
        .run()
    })
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const screenId = $ScreenId('screenId')
      const date = new Date()

      return Gwt.test($CreateScreening.handler)
        .prepare(
          gen(function* (_) {
            yield* _(
              $Repository.insert<Film>(
                yield* _($Film()({ name: 'filmName' }, { id: filmId })),
              ),
            )
          }),
        )
        .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
        .then(Error(`Cannot find entity "${screenId}" of type "Screen"`))
        .run()
    })
    it('', async () => {
      const aggregateId = $AggregateId('aggregateId')
      const filmId = $FilmId('filmId')
      const filmName = 'filmName'
      const screenId = $ScreenId('screenId')
      const screenName = 'screenName'
      const seats = { rows: 42, columns: 1138 }
      const date = new Date()

      return Gwt.test($CreateScreening.handler)
        .prepare(
          gen(function* (_) {
            yield* _(
              $Repository.insert<Screen>(
                yield* _(
                  $Screen()({ name: screenName, seats }, { id: screenId }),
                ),
              ),
            )
            yield* _(
              $Repository.insert<Film>(
                yield* _($Film()({ name: filmName }, { id: filmId })),
              ),
            )
          }),
        )
        .when($CreateScreening()({ aggregateId, filmId, screenId, date })())
        .then(
          $ScreeningCreated()({
            aggregateId,
            filmId,
            filmName,
            screenId,
            screenName,
            date,
            seats,
          })(),
        )
        .run()
    })
  })
})
