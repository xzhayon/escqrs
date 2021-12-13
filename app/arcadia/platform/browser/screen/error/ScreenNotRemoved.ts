export class ScreenNotRemoved extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreenNotRemoved.prototype)
  }
}
