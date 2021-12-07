export class FileNotFound extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, FileNotFound.prototype)
  }

  static build(path: string) {
    return new FileNotFound(`Cannot find file "${path}"`)
  }
}
