export class ScreenNotEdited extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreenNotEdited.prototype)
  }
}
