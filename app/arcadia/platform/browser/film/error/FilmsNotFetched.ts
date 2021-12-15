export class FilmsNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmsNotFetched.prototype)
  }
}
