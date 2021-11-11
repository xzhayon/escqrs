import { MutableEntity } from '../../../core/entities/Entity'
import { Film } from '../entities/Film'
import { Screen } from '../entities/Screen'

export interface Screening extends MutableEntity<'Projection.Screening'> {
  readonly film: { name: Film['name'] }
  readonly screen: { name: Screen['name'] }
  readonly date: Date
  readonly seats: {
    readonly total: number
    readonly free: number
  }
}
