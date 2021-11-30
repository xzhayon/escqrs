import { Branded } from '@effect-ts/core'
import { $MutableEntity, MutableEntity } from '../../src/MutableEntity'

export interface Film extends MutableEntity<'Film', FilmId> {}

export type FilmId = Branded.Branded<string, 'FilmId'>

export function $Film() {
  return $MutableEntity<Film>('Film')
}

export const $FilmId = (id: string): FilmId => Branded.makeBranded(id)
