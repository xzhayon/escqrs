import { cloneableGenerator } from '@redux-saga/testing-utils'
import { takeLatest } from 'typed-redux-saga'
import { coordinate, fetchScreenings } from './saga'
import { $ScreeningCreation } from './upsertion/creation/slice'

describe('ScreeningSaga', () => {
  describe('coordinate', () => {
    const saga = cloneableGenerator(coordinate)()

    test('waiting for screening creation', () => {
      expect(saga.next().value).toStrictEqual(
        takeLatest(
          [$ScreeningCreation.ScreeningCreationAccepted.type],
          fetchScreenings,
        ).next().value,
      )
    })

    test('closing saga', () => {
      expect(saga.next().done).toBeTruthy()
    })
  })
})
