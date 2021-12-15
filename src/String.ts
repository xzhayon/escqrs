import { Array, Function } from '@effect-ts/core'
import { flow } from '@effect-ts/core/Function'

const uppercase = <A extends string>(s: A): Uppercase<A> =>
  s.toUpperCase() as Uppercase<A>

const lowercase = <A extends string>(s: A): Lowercase<A> =>
  s.toLowerCase() as Lowercase<A>

const capitalize = <A extends string>(s: A): Capitalize<A> =>
  (isEmpty(s) ? s : s[0].toUpperCase() + s.slice(1)) as Capitalize<A>

const uncapitalize = <A extends string>(s: A): Uncapitalize<A> =>
  (isEmpty(s) ? s : s[0].toLowerCase() + s.slice(1)) as Uncapitalize<A>

const splitWords = (s: string) =>
  s
    .replace(
      /[^0-9A-Za-z]+|([0-9a-z])([A-Z])|([A-Z]{2}[0-9]*)([a-z])/g,
      '$1$3\0$2$4',
    )
    .split('\0')
    .filter(Function.not(isEmpty))

const pascal = flow(
  splitWords,
  Array.map(lowercase),
  Array.map(capitalize),
  Array.join(''),
)

const camel = flow(pascal, uncapitalize)

const snake = flow(splitWords, Array.join('_'), lowercase)

const kebab = flow(splitWords, Array.join('-'), lowercase)

const isEmpty = (s: string) => '' === s

export const $String = {
  uppercase,
  lowercase,
  capitalize,
  uncapitalize,
  camel,
  pascal,
  snake,
  kebab,
  isEmpty,
}
