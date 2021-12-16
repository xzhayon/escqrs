import { cloneableGenerator } from '@redux-saga/testing-utils'
import { call, getContext, put, takeLeading } from 'typed-redux-saga'
import { $Film, Film } from '../../../../../film/Film'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { editFilm, fetchAndEdit } from './saga'
import { $FilmEditing } from './slice'

describe('FilmEditingSaga', () => {
  describe('fetchAndEdit', () => {
    const filmId = $Film.id('filmId')
    const film: Film = {
      _: {
        type: 'Film',
        id: filmId,
        date: { created: new Date(), updated: new Date() },
        version: 0,
      },
      title: 'filmTitle',
    }
    const saga = cloneableGenerator(fetchAndEdit(filmId))(
      $FilmEditing.fetchFilm(),
    )

    test('starting saga', () => {
      expect(saga.next().value).toStrictEqual(
        put($FilmEditing.FilmFetchingStarted()).next().value,
      )
    })
    test('getting client from context', () => {
      expect(saga.next().value).toStrictEqual(
        getContext('arcadiaClient').next().value,
      )
    })
    test('fetching films', () => {
      const arcadia: Pick<ArcadiaClient, 'getFilm'> = {
        getFilm: async () => film,
      }

      expect(saga.next(arcadia).value).toStrictEqual(
        call(arcadia.getFilm, filmId).next().value,
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
          put($FilmEditing.FilmNotFetched(error)).next().value,
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

      test('returning film', () => {
        expect(clone.next(film).value).toStrictEqual(
          put($FilmEditing.FilmFetched(film)).next().value,
        )
      })
      test('listening for film editing', () => {
        expect(JSON.stringify(clone.next().value)).toStrictEqual(
          JSON.stringify(
            takeLeading($FilmEditing.editFilm.type, editFilm(filmId)).next()
              .value,
          ),
        )
      })
      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })
  })

  describe('editFilm', () => {
    const filmId = $Film.id('filmId')
    const filmTitle = 'filmTitle'
    const saga = cloneableGenerator(editFilm(filmId))(
      $FilmEditing.editFilm({ title: filmTitle }),
    )

    test('starting saga', () => {
      expect(saga.next().value).toStrictEqual(
        put($FilmEditing.FilmEditingRequested()).next().value,
      )
    })
    test('getting client from context', () => {
      expect(saga.next().value).toStrictEqual(
        getContext('arcadiaClient').next().value,
      )
    })
    test('fetching films', () => {
      const arcadia: Pick<ArcadiaClient, 'editFilm'> = {
        editFilm: async () => {},
      }

      expect(saga.next(arcadia).value).toStrictEqual(
        call(arcadia.editFilm, filmId, { title: filmTitle }).next().value,
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
          put($FilmEditing.FilmEditingRejected(error)).next().value,
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

      test('confirming film editing', () => {
        expect(clone.next().value).toStrictEqual(
          put($FilmEditing.FilmEditingAccepted()).next().value,
        )
      })
      test('closing saga', () => {
        expect(clone.next().done).toBeTruthy()
      })
    })
  })
})
