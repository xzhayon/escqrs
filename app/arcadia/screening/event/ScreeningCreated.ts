import { Id } from '../../../../src/entity/Entity'
import { $Event, Event } from '../../../../src/entity/message/event/Event'
import { Film } from '../../film/Film'
import { Screen } from '../../screen/Screen'
import { Screening } from '../Screening'

export interface ScreeningCreated extends Event<Screening, 'ScreeningCreated'> {
  readonly filmId: Id<Film>
  readonly filmTitle: string
  readonly date: Date
  readonly screenId: Id<Screen>
  readonly screenName: string
  readonly seats: Screen['seats']
}

export function $ScreeningCreated() {
  return $Event<ScreeningCreated>('ScreeningCreated')
}
