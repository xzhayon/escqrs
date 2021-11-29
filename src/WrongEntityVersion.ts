export class WrongEntityVersion extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, WrongEntityVersion.prototype)
  }

  static build(
    entityType: string,
    entityId: string,
    expectedVersion: number,
    actualVersion: number,
  ) {
    return new WrongEntityVersion(
      `Cannot save aggregate "${entityId}" of type "${entityType}" with version "${actualVersion}", version "${expectedVersion}" expected`,
    )
  }
}
