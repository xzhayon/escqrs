import { Branded } from '@effect-ts/core'
import * as t from 'io-ts'
import { $Aggregate } from '../../../src/Aggregate'
import { DeepPartial } from '../../../src/DeepPartial'
import { Body, Id } from '../../../src/entity/Entity'
import {
  $MutableEntity,
  $MutableEntityC,
  MutableEntity,
} from '../../../src/entity/MutableEntity'

export interface Film
  extends MutableEntity<'Film', Branded.Branded<string, 'FilmId'>> {
  readonly title: string
}

export const $FilmC: t.Type<Film> = t.intersection(
  [
    t.readonly(t.type({ title: t.string }), 'Body'),
    $MutableEntityC(t.literal('Film') as t.Mixed, t.string as t.Mixed),
  ],
  'Film',
)

const aggregate = $Aggregate<Film>('Film')

export function $Film() {
  return $MutableEntity<Film>('Film')
}

$Film.id = aggregate.id
$Film.load = aggregate.load
$Film.save = aggregate.save

$Film.create = (id: Id<Film>, title: string) => $Film()({ title }, { id })

$Film.edit = (film: Film, body: DeepPartial<Body<Film>>) => ({
  ...film,
  title: body.title ?? film.title,
})
