import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../src/entity/Entity'
import { Screen } from '../../../../screen/Screen'
import { Command, Event } from '../../Message'
import { ScreensNotFetched } from '../error/ScreensNotFetched'

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
    start() {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    fetchScreens(_, _command: Command<void, Array.Array<Screen>>) {},
    ScreensFetchingStarted(state) {
      state.isLoading = true
    },
    ScreensNotFetched(state, _event: Event<Error>) {
      state.isLoading = false
      state.error = new ScreensNotFetched()
    },
    ScreensFetched(state, event: Event<Array.Array<Screen>>) {
      state.isLoading = false
      state.error = undefined
      state.screens = event.payload.map((screen) => ({
        id: screen._.id,
        name: screen.name,
        seats: screen.seats.rows * screen.seats.columns,
      }))
    },
  },
})

export const $ScreenDashboard = $ScreenDashboardSlice.actions
