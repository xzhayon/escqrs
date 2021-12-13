export class FilmNotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmNotCreated.prototype)
  }
}
