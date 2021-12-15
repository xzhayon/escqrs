import { $String } from './String'

describe('String', () => {
  describe('camel', () => {
    test.each([
      ['foo', 'foo'],
      ['Foo', 'foo'],
      ['fooBar', 'fooBar'],
      ['FooBar', 'fooBar'],
      ['_foo', 'foo'],
      ['foo_', 'foo'],
      ['foo.bar', 'fooBar'],
      ['foo_bar', 'fooBar'],
      ['foo-bar', 'fooBar'],
      ['foo bar', 'fooBar'],
      ['foo._- bar', 'fooBar'],
      ['FOObar', 'fooBar'],
      ['fooBAR', 'fooBar'],
      ['0foo', '0foo'],
      ['foo0', 'foo0'],
      ['f0b', 'f0b'],
      ['F0b', 'f0b'],
      ['f0B', 'f0B'],
      ['F0B', 'f0B'],
      ['foo0bar', 'foo0bar'],
      ['foo0Bar', 'foo0Bar'],
      ['foo0._- bar', 'foo0Bar'],
      ['FOO0bar', 'foo0Bar'],
      ['foo0BAR', 'foo0Bar'],
    ])('converting "%s" to "%s"', (from, to) => {
      expect($String.camel(from)).toStrictEqual(to)
    })
  })
  describe('pascal', () => {
    test.each([
      ['foo', 'Foo'],
      ['Foo', 'Foo'],
      ['fooBar', 'FooBar'],
      ['FooBar', 'FooBar'],
      ['_foo', 'Foo'],
      ['foo_', 'Foo'],
      ['foo.bar', 'FooBar'],
      ['foo_bar', 'FooBar'],
      ['foo-bar', 'FooBar'],
      ['foo bar', 'FooBar'],
      ['foo._- bar', 'FooBar'],
      ['FOObar', 'FooBar'],
      ['fooBAR', 'FooBar'],
      ['0foo', '0foo'],
      ['foo0', 'Foo0'],
      ['f0b', 'F0b'],
      ['F0b', 'F0b'],
      ['f0B', 'F0B'],
      ['F0B', 'F0B'],
      ['foo0bar', 'Foo0bar'],
      ['foo0Bar', 'Foo0Bar'],
      ['foo0._- bar', 'Foo0Bar'],
      ['FOO0bar', 'Foo0Bar'],
      ['foo0BAR', 'Foo0Bar'],
    ])('converting "%s" to "%s"', (from, to) => {
      expect($String.pascal(from)).toStrictEqual(to)
    })
  })
  describe('snake', () => {
    test.each([
      ['foo', 'foo'],
      ['Foo', 'foo'],
      ['fooBar', 'foo_bar'],
      ['FooBar', 'foo_bar'],
      ['_foo', 'foo'],
      ['foo_', 'foo'],
      ['foo.bar', 'foo_bar'],
      ['foo_bar', 'foo_bar'],
      ['foo-bar', 'foo_bar'],
      ['foo bar', 'foo_bar'],
      ['foo._- bar', 'foo_bar'],
      ['FOObar', 'foo_bar'],
      ['fooBAR', 'foo_bar'],
      ['0foo', '0foo'],
      ['foo0', 'foo0'],
      ['f0b', 'f0b'],
      ['F0b', 'f0b'],
      ['f0B', 'f0_b'],
      ['F0B', 'f0_b'],
      ['foo0bar', 'foo0bar'],
      ['foo0Bar', 'foo0_bar'],
      ['foo0._- bar', 'foo0_bar'],
      ['FOO0bar', 'foo0_bar'],
      ['foo0BAR', 'foo0_bar'],
    ])('converting "%s" to "%s"', (from, to) => {
      expect($String.snake(from)).toStrictEqual(to)
    })
  })
  describe('kebab', () => {
    test.each([
      ['foo', 'foo'],
      ['Foo', 'foo'],
      ['fooBar', 'foo-bar'],
      ['FooBar', 'foo-bar'],
      ['_foo', 'foo'],
      ['foo_', 'foo'],
      ['foo.bar', 'foo-bar'],
      ['foo_bar', 'foo-bar'],
      ['foo-bar', 'foo-bar'],
      ['foo bar', 'foo-bar'],
      ['foo._- bar', 'foo-bar'],
      ['FOObar', 'foo-bar'],
      ['fooBAR', 'foo-bar'],
      ['0foo', '0foo'],
      ['foo0', 'foo0'],
      ['f0b', 'f0b'],
      ['F0b', 'f0b'],
      ['f0B', 'f0-b'],
      ['F0B', 'f0-b'],
      ['foo0bar', 'foo0bar'],
      ['foo0Bar', 'foo0-bar'],
      ['foo0._- bar', 'foo0-bar'],
      ['FOO0bar', 'foo0-bar'],
      ['foo0BAR', 'foo0-bar'],
    ])('converting "%s" to "%s"', (from, to) => {
      expect($String.kebab(from)).toStrictEqual(to)
    })
  })
})
