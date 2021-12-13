export class FilmsAndScreensNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmsAndScreensNotFetched.prototype)
  }
}
