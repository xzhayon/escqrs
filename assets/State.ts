import { $Store } from './Store'

export type State = ReturnType<typeof $Store['getState']>
