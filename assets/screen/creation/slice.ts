import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../../app/arcadia/Screen'
import { Command, Event } from '../../Message'

export interface ScreenCreationState {
  isLoading?: boolean
  error?: Error
}

const initialState: ScreenCreationState = {}

export const $ScreenCreationSlice = createSlice({
  name: 'ScreenCreation',
  initialState,
  reducers: {
    Start() {},
    Create(
      _,
      _command: Command<
        { name: string; seats: { rows: number; columns: number } },
        Screen
      >,
    ) {},
    Stop() {},
    Started() {},
    CreationStarted(state) {
      state.isLoading = true
    },
    NotCreated(state, event: Event<Error>) {
      state.isLoading = false
      state.error = event.payload
    },
    Created(state, _event: Event<Screen>) {
      state.isLoading = false
      state.error = undefined
    },
    Stopped() {},
  },
})

export const $ScreenCreation = $ScreenCreationSlice.actions
