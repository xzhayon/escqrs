import { Branded } from '@effect-ts/core'
import { $MutableEntity, MutableEntity } from '../../../core/entities/Entity'

export interface Screen extends MutableEntity<'Screen', ScreenId> {
  readonly name: string
  readonly seats: {
    readonly rows: number
    readonly columns: number
  }
}

export type ScreenId = Branded.Branded<string, 'ScreenId'>

export const $ScreenId = (id: string): ScreenId => id as ScreenId

export function $Screen() {
  return $MutableEntity<Screen>('Screen')
}
