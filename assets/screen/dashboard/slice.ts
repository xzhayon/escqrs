import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../../app/arcadia/Screen'
import { Id } from '../../../src/entity/Entity'
import { Command, Event } from '../../Message'

export interface ScreenDashboardState {
  isLoading?: boolean
  error?: Error
  screens?: Array.Array<{ id: Id<Screen>; name: string; seats: number }>
}

const initialState: ScreenDashboardState = {}

export const $ScreenDashboardSlice = createSlice({
  name: 'ScreenDashboard',
  initialState,
  reducers: {
    Start() {},
    FetchList(_, _command: Command<void, Array.Array<Screen>>) {},
    Stop() {},
    Started() {},
    ListFetchingStarted(state) {
      state.isLoading = true
    },
    ListNotFetched(state, _event: Event<Error>) {
      state.isLoading = false
      state.error = new ListNotFetched()
    },
    ListFetched(state, event: Event<Array.Array<Screen>>) {
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

export const $ScreenDashboard = $ScreenDashboardSlice.actions

export class ListNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ListNotFetched.prototype)
  }
}
