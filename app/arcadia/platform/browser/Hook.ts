import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { State } from './State'
import { $Store } from './Store'

export const use$Dispatch = () => useDispatch<typeof $Store['dispatch']>()

export const use$Selector: TypedUseSelectorHook<State> = useSelector
