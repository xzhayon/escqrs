import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../../app/arcadia/Screen'
import { Id } from '../../../src/entity/Entity'
import { Command, Event } from '../../Message'

export interface ScreenRemovalState {
  state?: 'FetchingDetail' | 'Removing'
  error?: Error
  screen?: { name: string }
}

const initialState: ScreenRemovalState = {}

export const $ScreenRemovalSlice = createSlice({
  name: 'ScreenRemoval',
  initialState,
  reducers: {
    Start(_, _command: Command<{ id: Id<Screen> }>) {},
    FetchDetail(_, _command: Command<void, Screen>) {},
    Remove(_, _command: Command) {},
    Stop() {},
    Started() {},
    DetailFetchingStarted(state) {
      state.state = 'FetchingDetail'
    },
    DetailNotFetched(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new DetailNotFetched()
    },
    DetailFetched(state, event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
      state.screen = { name: event.payload.name }
    },
    RemovalStarted(state) {
      state.state = 'Removing'
    },
    NotRemoved(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotRemoved()
    },
    Removed(state) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $ScreenRemoval = $ScreenRemovalSlice.actions

export class DetailNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, DetailNotFetched.prototype)
  }
}

export class NotRemoved extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotRemoved.prototype)
  }
}
