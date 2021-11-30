import { ScreeningId } from './Screening'

export class ScreeningExpired extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, ScreeningExpired.prototype)
  }

  static build(screeningId: ScreeningId, date: Date) {
    return new ScreeningExpired(`Screening "${screeningId}" expired on ${date}`)
  }
}
