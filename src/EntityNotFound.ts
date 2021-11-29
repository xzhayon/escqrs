export class EntityNotFound extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, EntityNotFound.prototype)
  }

  static build(entityType: string, entityId: string) {
    return new EntityNotFound(
      `Cannot find entity "${entityId}" of type "${entityType}"`,
    )
  }

  static missingEvents(entityType: string, entityId: string) {
    return new EntityNotFound(
      `Cannot find events for aggregate "${entityId}" of type "${entityType}"`,
    )
  }

  static unreducibleEvents(entityType: string, entityId: string) {
    return new EntityNotFound(
      `Cannot reduce events into aggregate "${entityId}" of type "${entityType}"`,
    )
  }
}
