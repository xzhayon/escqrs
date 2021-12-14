export class ScreeningsNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreeningsNotFetched.prototype)
  }
}
