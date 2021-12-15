import { $Error } from './Error'

describe('Error', () => {
  describe('fromUnknown', () => {
    test('constructing from a generic value', () => {
      expect($Error.fromUnknown(Error('foo'))(42)).toStrictEqual(Error('foo'))
    })
    test('constructing from a string', () => {
      expect($Error.fromUnknown(Error('foo'))('bar')).toStrictEqual(
        Error('bar'),
      )
    })
    test('constructing from an error', () => {
      const error: Error = { name: 'Bar', message: 'bar' }

      expect($Error.fromUnknown(Error('foo'))(error)).toStrictEqual(
        Error(error.message),
      )
    })
    test('constructing from an error instance', () => {
      const error = new Error('bar')

      expect($Error.fromUnknown(Error('foo'))(error)).toStrictEqual(error)
    })
  })
})
