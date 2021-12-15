import { cloneableGenerator } from '@redux-saga/testing-utils'
import { all, call, getContext, put, takeLeading } from 'typed-redux-saga'
import { $Film } from '../../../../../film/Film'
import { $Screen } from '../../../../../screen/Screen'
import { $Screening } from '../../../../../screening/Screening'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { createScreening, fetchAndCreate } from './saga'
import { $ScreeningCreation } from './slice'

describe('ScreeningCreationSaga', () => {
  describe('fetchAndCreate', () => {
    const screeningId = $Screening.id('screeningId')
    const saga = cloneableGenerator(fetchAndCreate(screeningId))(
      $ScreeningCreation.fetchFilmsAndScreens(),
    )

    test('starting saga', () => {
      expect(saga.next().value).toStrictEqual(
        put($ScreeningCreation.FilmsAndScreensFetchingStarted()).next().value,
      )
    })

    test('getting client from context', () => {
      expect(saga.next().value).toStrictEqual(
        getContext('arcadiaClient').next().value,
      )
    })

    test('fetching films and screens', () => {
      const arcadia: Pick<ArcadiaClient, 'getFilms' | 'getScreens'> = {
        getFilms: async () => [],
        getScreens: async () => [],
      }

      expect(saga.next(arcadia).value).toStrictEqual(
        all([call(arcadia.getFilms), call(arcadia.getScreens)]).next().value,
      )
    })

    describe('request failed', () => {
      let clone: ReturnType<typeof saga.clone>

      beforeAll(() => {
        clone = saga.clone()
      })

      test('handling client error', () => {
        const error = Error()

        expect(clone.throw && clone.throw(error).value).toStrictEqual(
          put($ScreeningCreation.FilmsAndScreensNotFetched(error)).next().value,
        )
      })

      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })

    describe('request succeeded', () => {
      let clone: ReturnType<typeof saga.clone>

      beforeAll(() => {
        clone = saga.clone()
      })

      test('returning result', () => {
        expect(clone.next([[], []]).value).toStrictEqual(
          put(
            $ScreeningCreation.FilmsAndScreensFetched({
              films: [],
              screens: [],
            }),
          ).next().value,
        )
      })

      test('listening for screening creation', () => {
        expect(JSON.stringify(clone.next().value)).toStrictEqual(
          JSON.stringify(
            takeLeading(
              $ScreeningCreation.createScreening.type,
              createScreening(screeningId),
            ).next().value,
          ),
        )
      })

      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })
  })

  describe('createScreening', () => {
    const screeningId = $Screening.id('screeningId')
    const filmId = $Film.id('filmId')
    const screenId = $Screen.id('screenId')
    const date = new Date()
    const saga = cloneableGenerator(createScreening(screeningId))(
      $ScreeningCreation.createScreening({ filmId, screenId, date }),
    )

    test('starting saga', () => {
      expect(saga.next().value).toStrictEqual(
        put($ScreeningCreation.ScreeningCreationRequested()).next().value,
      )
    })

    test('getting client from context', () => {
      expect(saga.next().value).toStrictEqual(
        getContext('arcadiaClient').next().value,
      )
    })

    test('creating screening', () => {
      const arcadia: Pick<ArcadiaClient, 'createScreening'> = {
        createScreening: async () => {},
      }

      expect(saga.next(arcadia).value).toStrictEqual(
        call(
          arcadia.createScreening,
          screeningId,
          filmId,
          screenId,
          date,
        ).next().value,
      )
    })

    describe('request failed', () => {
      let clone: ReturnType<typeof saga.clone>

      beforeAll(() => {
        clone = saga.clone()
      })

      test('handling client error', () => {
        const error = Error()

        expect(clone.throw && clone.throw(error).value).toStrictEqual(
          put($ScreeningCreation.ScreeningCreationRejected(error)).next().value,
        )
      })

      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })

    describe('request succeeded', () => {
      let clone: ReturnType<typeof saga.clone>

      beforeAll(() => {
        clone = saga.clone()
      })

      test('confirming creation', () => {
        expect(clone.next().value).toStrictEqual(
          put($ScreeningCreation.ScreeningCreationAccepted()).next().value,
        )
      })

      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })
  })
})
