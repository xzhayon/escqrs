import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../app/arcadia/Screen'
import { Id } from '../../src/Entity'
import { Command, Event } from './Message'

export interface ScreenListState {
  isLoading?: boolean
  error?: Error
  screens?: Array.Array<{ id: Id<Screen>; name: string; seats: number }>
}

const initialState: ScreenListState = {}

export const $ScreenListSlice = createSlice({
  name: 'ScreenList',
  initialState,
  reducers: {
    Start() {},
    Fetch(_, _command: Command<void, Array.Array<Screen>>) {},
    Stop() {},
    Started() {},
    FetchStarted(state) {
      state.isLoading = true
    },
    NotFetched(state, event: Event<Error>) {
      state.isLoading = false
      state.error = event.payload
    },
    Fetched(state, event: Event<Array.Array<Screen>>) {
      state.isLoading = false
      state.error = undefined
      state.screens = event.payload.map((screen) => ({
        id: screen._.id,
        name: screen.name,
        seats: screen.seats.rows * screen.seats.columns,
      }))
    },
    Stopped: () => initialState,
  },
})

export const ScreenList = $ScreenListSlice.actions
