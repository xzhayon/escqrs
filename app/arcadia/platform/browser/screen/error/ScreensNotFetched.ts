export class ScreensNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreensNotFetched.prototype)
  }
}
