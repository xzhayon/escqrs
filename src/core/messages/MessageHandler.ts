export interface MessageHandler<A extends string = string> {
  readonly messageType: A
}
