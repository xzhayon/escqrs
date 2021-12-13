export class FilmRemovalRejected extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmRemovalRejected.prototype)
  }
}
