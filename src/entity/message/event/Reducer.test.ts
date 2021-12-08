import { Entity } from '../../Entity'
import { Event } from './Event'
import { $Reducer } from './Reducer'

interface Foo extends Entity<'Foo'> {
  readonly bar: number
}

interface Add extends Event<Foo, 'Add'> {
  readonly bar: number
}
interface Sub extends Event<Foo, 'Sub'> {
  readonly bar: number
}
interface Mul extends Event<Foo, 'Mul'> {
  readonly bar: number
}
interface Div extends Event<Foo, 'Div'> {
  readonly bar: number
}

describe('Reducer', () => {
  describe('compose', () => {
    test('composing simple reducers', () => {
      const reducer = $Reducer.compose<Foo, Add | Sub | Mul | Div>({
        Add: (foo, { bar }) => ({ bar: (foo?.bar ?? 0) + bar }),
        Sub: (foo, { bar }) => ({ bar: (foo?.bar ?? 0) - bar }),
        Mul: (foo, { bar }) => ({ bar: (foo?.bar ?? 0) * bar }),
        Div: (foo, { bar }) => ({ bar: (foo?.bar ?? 0) / bar }),
      })

      expect(
        [
          { _: { type: 'Add' }, bar: 1 } as Add,
          { _: { type: 'Sub' }, bar: 2 } as Sub,
          { _: { type: 'Mul' }, bar: 3 } as Mul,
          { _: { type: 'Div' }, bar: 4 } as Div,
        ].reduce(reducer, undefined),
      ).toMatchObject({ bar: ((1 - 2) * 3) / 4 })
    })
  })
})
