import { Either } from '@effect-ts/core'
import * as t from 'io-ts'
import { $Any } from './Any'

describe('Any', () => {
  describe('bit', () => {
    test.each([0 as const, 1 as const])(
      'decoding and encoding successfully (%p)',
      (value) => {
        expect($Any.decode($Any.bit)(value)).toStrictEqual(Either.right(value))
        expect($Any.bit.encode(value)).toStrictEqual(value)
      },
    )
    test.each([undefined, false, true, '0', '1', 42])(
      'failing decoding (%p)',
      (value) => {
        expect($Any.decode($Any.bit)(value)).toBeInstanceOf(Either.Left)
      },
    )
  })

  describe('booleanFromBit', () => {
    test.each([
      [0, false],
      [1, true],
    ])('decoding and encoding successfully (%p)', (value, decoded) => {
      expect($Any.decode($Any.booleanFromBit)(value)).toStrictEqual(
        Either.right(decoded),
      )
      expect($Any.booleanFromBit.encode(decoded)).toStrictEqual(value)
    })
    test.each([undefined, false, true, '0', '1', 42])(
      'failing decoding (%p)',
      (value) => {
        expect($Any.decode($Any.booleanFromBit)(value)).toBeInstanceOf(
          Either.Left,
        )
      },
    )
  })

  describe('decode', () => {
    test('decoding successfully', () => {
      expect($Any.decode(t.boolean)(true)).toStrictEqual(Either.right(true))
    })
    test('failing decoding', () => {
      expect($Any.decode(t.boolean)(42)).toBeInstanceOf(Either.Left)
    })
  })
})
