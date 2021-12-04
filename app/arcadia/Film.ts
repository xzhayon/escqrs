import { Branded } from '@effect-ts/core'
import { $Aggregate } from '../../src/Aggregate'
import { $MutableEntity, MutableEntity } from '../../src/MutableEntity'

export interface Film
  extends MutableEntity<'Film', Branded.Branded<string, 'FilmId'>> {
  readonly title: string
}

const aggregate = $Aggregate<Film>('Film')

export function $Film() {
  return $MutableEntity<Film>('Film')
}

$Film.id = aggregate.id
$Film.load = aggregate.load
$Film.save = aggregate.save
