import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { ScreeningProjection } from '../../../../projection/Screening'
import { Command, Event } from '../../Message'
import { ScreeningsNotFetched } from '../error/ScreeningsNotFetched'

export interface ScreeningDashboardState {
  isLoading?: boolean
  error?: Error
  screenings?: Array.Array<ScreeningProjection>
}

const initialState: ScreeningDashboardState = {}

export const $ScreeningDashboardSlice = createSlice({
  name: 'ScreeningDashboard',
  initialState,
  reducers: {
    start() {},
    Started() {},
    stop() {},
    Stopped() {},
    fetchScreenings(
      _,
      _command: Command<void, Array.Array<ScreeningProjection>>,
    ) {},
    ScreeningsFetchingStarted(state) {
      state.isLoading = true
    },
    ScreeningsNotFetched(state, _event: Event<Error>) {
      state.isLoading = false
      state.error = new ScreeningsNotFetched()
    },
    ScreeningsFetched(state, event: Event<Array.Array<ScreeningProjection>>) {
      state.isLoading = false
      state.error = undefined
      state.screenings = [...event.payload]
    },
  },
})

export const $ScreeningDashboard = $ScreeningDashboardSlice.actions
