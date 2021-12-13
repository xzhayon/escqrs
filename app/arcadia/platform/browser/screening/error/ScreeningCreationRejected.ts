export class ScreeningCreationRejected extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreeningCreationRejected.prototype)
  }
}
