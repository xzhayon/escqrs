export class ScreenNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreenNotFetched.prototype)
  }
}
