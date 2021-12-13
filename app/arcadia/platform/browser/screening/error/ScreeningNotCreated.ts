export class ScreeningNotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreeningNotCreated.prototype)
  }
}
