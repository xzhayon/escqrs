export class FilmCreationRejected extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmCreationRejected.prototype)
  }
}
