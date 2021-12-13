export class FilmNotRemoved extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmNotRemoved.prototype)
  }
}
