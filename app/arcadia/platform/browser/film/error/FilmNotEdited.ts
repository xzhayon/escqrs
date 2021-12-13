export class FilmNotEdited extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmNotEdited.prototype)
  }
}
