import { Branded } from '@effect-ts/core'
import { $MutableEntity, MutableEntity } from '../../src/MutableEntity'

export interface Screen extends MutableEntity<'Screen', ScreenId> {
  readonly name: string
  readonly seats: {
    readonly rows: number
    readonly columns: number
  }
}

export type ScreenId = Branded.Branded<string, 'ScreenId'>

export function $Screen() {
  return $MutableEntity<Screen>('Screen')
}

export const $ScreenId = (id: string): ScreenId => Branded.makeBranded(id)
