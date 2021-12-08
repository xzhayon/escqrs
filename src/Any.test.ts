import { Either } from '@effect-ts/core'
import * as t from 'io-ts'
import { $Any } from './Any'

describe('Any', () => {
  describe('decode', () => {
    test('decoding successfully', () => {
      expect($Any.decode(t.boolean)(true)).toStrictEqual(Either.right(true))
    })
    test('failing decoding', () => {
      expect($Any.decode(t.boolean)(42)).toBeInstanceOf(Either.Left)
    })
  })
})
