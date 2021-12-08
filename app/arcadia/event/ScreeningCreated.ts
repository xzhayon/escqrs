import { $Event, Event } from '../../../src/entity/message/event/Event'
import { Screen } from '../Screen'
import { Screening } from '../Screening'

export interface ScreeningCreated extends Event<Screening, 'ScreeningCreated'> {
  readonly date: Date
  readonly seats: Screen['seats']
}

export function $ScreeningCreated() {
  return $Event<ScreeningCreated>('ScreeningCreated')
}
