export class NotADirectory extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, NotADirectory.prototype)
  }

  static build(path: string) {
    return new NotADirectory(`File "${path}" isn't a directory`)
  }
}
