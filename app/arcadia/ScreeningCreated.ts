import { $Event, Event } from '../../src/Event'
import { Screen } from './Screen'

export interface ScreeningCreated extends Event<'ScreeningCreated'> {
  readonly date: Date
  readonly seats: Screen['seats']
}

export function $ScreeningCreated() {
  return $Event<ScreeningCreated>('ScreeningCreated')
}
