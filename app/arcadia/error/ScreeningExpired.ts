import { Id } from '../../../src/entity/Entity'
import { Screening } from '../screening/Screening'

export class ScreeningExpired extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, ScreeningExpired.prototype)
  }

  static build(screeningId: Id<Screening>, date: Date) {
    return new ScreeningExpired(`Screening "${screeningId}" expired on ${date}`)
  }
}
