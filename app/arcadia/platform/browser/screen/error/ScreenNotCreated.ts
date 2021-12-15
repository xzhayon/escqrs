export class ScreenNotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreenNotCreated.prototype)
  }
}
