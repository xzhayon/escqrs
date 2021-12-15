export class FilmNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmNotFetched.prototype)
  }
}
