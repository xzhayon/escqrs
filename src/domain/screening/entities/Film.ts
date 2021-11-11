import { Branded } from '@effect-ts/core'
import { $MutableEntity, MutableEntity } from '../../../core/entities/Entity'

export interface Film extends MutableEntity<'Film', FilmId> {
  readonly name: string
}

export type FilmId = Branded.Branded<string, 'FilmId'>

export const $FilmId = (id: string): FilmId => id as FilmId

export function $Film() {
  return $MutableEntity<Film>('Film')
}
