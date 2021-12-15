export class FilmEditingRejected extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmEditingRejected.prototype)
  }
}
