import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../../../app/arcadia/screen/Screen'
import { Command, Event } from '../../../Message'

export interface ScreenCreationState {
  state?: 'Creating'
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
      state.state = 'Creating'
    },
    NotCreated(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotCreated()
    },
    Created(state, _event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $ScreenCreation = $ScreenCreationSlice.actions

export class NotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotCreated.prototype)
  }
}
