import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../../src/entity/Entity'
import { Screen } from '../../../../../screen/Screen'
import { Command, Event } from '../../../Message'
import { ScreenNotEdited } from '../../error/ScreenNotEdited'
import { ScreenNotFetched } from '../../error/ScreenNotFetched'

export interface ScreenEditingState {
  state?: 'FetchingScreen' | 'EditingScreen'
  error?: Error
  screen?: { name: string; seats: { rows: number; columns: number } }
}

const initialState: ScreenEditingState = {}

export const $ScreenEditingSlice = createSlice({
  name: 'ScreenEditing',
  initialState,
  reducers: {
    start(_, _command: Command<{ id: Id<Screen> }>) {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    fetchScreen(_, _command: Command<void, Screen>) {},
    ScreenFetchingStarted(state) {
      state.state = 'FetchingScreen'
    },
    ScreenNotFetched(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new ScreenNotFetched()
    },
    ScreenFetched(state, event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
      state.screen = { name: event.payload.name, seats: event.payload.seats }
    },
    editScreen(
      _,
      _command: Command<
        { name: string; seats: { rows: number; columns: number } },
        Screen
      >,
    ) {},
    ScreenEditingStarted(state) {
      state.state = 'EditingScreen'
    },
    ScreenNotEdited(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new ScreenNotEdited()
    },
    ScreenEdited(state, _event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $ScreenEditing = $ScreenEditingSlice.actions
