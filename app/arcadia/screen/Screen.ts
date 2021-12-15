import { Branded } from '@effect-ts/core'
import * as t from 'io-ts'
import { $Aggregate } from '../../../src/Aggregate'
import {
  $MutableEntity,
  $MutableEntityC,
  MutableEntity,
} from '../../../src/entity/MutableEntity'

export interface Screen
  extends MutableEntity<'Screen', Branded.Branded<string, 'ScreenId'>> {
  readonly name: string
  readonly seats: {
    readonly rows: number
    readonly columns: number
  }
}

export const $ScreenC: t.Type<Screen> = t.intersection(
  [
    t.readonly(
      t.type({
        name: t.string,
        seats: t.readonly(t.type({ rows: t.number, columns: t.number })),
      }),
      'Body',
    ),
    $MutableEntityC(t.literal('Screen') as t.Mixed, t.string as t.Mixed),
  ],
  'Screen',
)

const aggregate = $Aggregate<Screen>('Screen')

export function $Screen() {
  return $MutableEntity<Screen>('Screen')
}

$Screen.id = aggregate.id
$Screen.load = aggregate.load
$Screen.save = aggregate.save
