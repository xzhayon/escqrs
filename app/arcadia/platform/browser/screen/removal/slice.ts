import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../src/entity/Entity'
import { Screen } from '../../../../screen/Screen'
import { Command, Event } from '../../Message'

export interface ScreenRemovalState {
  state?: 'FetchingScreen' | 'RemovingScreen'
  error?: Error
  screen?: { name: string }
}

const initialState: ScreenRemovalState = {}

export const $ScreenRemovalSlice = createSlice({
  name: 'ScreenRemoval',
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
      state.screen = { name: event.payload.name }
    },
    removeScreen(_, _command: Command) {},
    ScreenRemovalStarted(state) {
      state.state = 'RemovingScreen'
    },
    ScreenNotRemoved(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new ScreenNotRemoved()
    },
    ScreenRemoved(state) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $ScreenRemoval = $ScreenRemovalSlice.actions

export class ScreenNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreenNotFetched.prototype)
  }
}

export class ScreenNotRemoved extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreenNotRemoved.prototype)
  }
}
