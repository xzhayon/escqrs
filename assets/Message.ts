import { PayloadAction } from '@reduxjs/toolkit'

interface Handlers<Out = void> {
  readonly onFailure?: (error: Error) => void
  readonly onSuccess?: (payload: Out) => void
}

export type Command<
  In extends object | void = void,
  Out = void,
> = PayloadAction<
  In extends void ? Handlers<Out> | undefined : In & (Handlers<Out> | undefined)
>

export type Event<A = void> = PayloadAction<A>
