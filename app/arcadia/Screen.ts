import { Branded } from '@effect-ts/core'
import { $Aggregate } from '../../src/Aggregate'
import { $MutableEntity, MutableEntity } from '../../src/MutableEntity'

export interface Screen
  extends MutableEntity<'Screen', Branded.Branded<string, 'ScreenId'>> {
  readonly name: string
  readonly seats: {
    readonly rows: number
    readonly columns: number
  }
}

const aggregate = $Aggregate<Screen>('Screen')

export function $Screen() {
  return $MutableEntity<Screen>('Screen')
}

$Screen.id = aggregate.id
$Screen.load = aggregate.load
$Screen.save = aggregate.save
