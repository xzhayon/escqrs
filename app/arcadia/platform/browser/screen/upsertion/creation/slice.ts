import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../../../../screen/Screen'
import { Command, Event } from '../../../Message'
import { ScreenNotCreated } from '../../error/ScreenNotCreated'

export interface ScreenCreationState {
  state?: 'CreatingScreen'
  error?: Error
}

const initialState: ScreenCreationState = {}

export const $ScreenCreationSlice = createSlice({
  name: 'ScreenCreation',
  initialState,
  reducers: {
    start() {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    createScreen(
      _,
      _command: Command<
        { name: string; seats: { rows: number; columns: number } },
        Screen
      >,
    ) {},
    ScreenCreationStarted(state) {
      state.state = 'CreatingScreen'
    },
    ScreenNotCreated(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new ScreenNotCreated()
    },
    ScreenCreated(state, _event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $ScreenCreation = $ScreenCreationSlice.actions
