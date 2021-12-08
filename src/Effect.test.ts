import { Effect } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import { $Effect } from './Effect'

describe('Effect', () => {
  describe('is', () => {
    test.each([
      [undefined, false],
      [false, false],
      [0, false],
      ['', false],
      [[], false],
      [{}, false],
      [Promise.resolve(undefined), false],
      [() => Promise.resolve(undefined), false],
      [Effect.unit, true],
      [gen(function* (_) {}), true],
      [Layer.Empty, false],
    ])('refining value (#%#)', (value, expected) => {
      expect($Effect.is(value)).toBe(expected)
    })
  })
})
