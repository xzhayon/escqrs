import { cloneableGenerator } from '@redux-saga/testing-utils'
import { call, getContext, put } from 'typed-redux-saga'
import { $Film } from '../../../../../film/Film'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { createFilm } from './saga'
import { $FilmCreation } from './slice'

describe('FilmCreationSaga', () => {
  describe('createFilm', () => {
    const filmId = $Film.id('filmId')
    const filmTitle = 'filmTitle'
    const saga = cloneableGenerator(createFilm(filmId))(
      $FilmCreation.createFilm({ title: filmTitle }),
    )

    test('starting saga', () => {
      expect(saga.next().value).toStrictEqual(
        put($FilmCreation.FilmCreationRequested()).next().value,
      )
    })
    test('getting client from context', () => {
      expect(saga.next().value).toStrictEqual(
        getContext('arcadiaClient').next().value,
      )
    })
    test('creating film', () => {
      const arcadia: Pick<ArcadiaClient, 'createFilm'> = {
        createFilm: async () => {},
      }

      expect(saga.next(arcadia).value).toStrictEqual(
        call(arcadia.createFilm, filmId, filmTitle).next().value,
      )
    })

    describe('request failed', () => {
      let clone: ReturnType<typeof saga.clone>

      beforeAll(() => {
        clone = saga.clone()
      })

      test('handling error', () => {
        const error = Error()

        expect(clone.throw && clone.throw(error).value).toStrictEqual(
          put($FilmCreation.FilmCreationRejected(error)).next().value,
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
          put($FilmCreation.FilmCreationAccepted()).next().value,
        )
      })
      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })
  })
})
