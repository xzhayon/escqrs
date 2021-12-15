import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { ScreeningsByFilm } from '../../../../projection/ScreeningsByFilm'
import { Command, Event } from '../../Message'
import { ScreeningsNotFetched } from '../error/ScreeningsNotFetched'

export interface ScreeningDashboardState {
  isLoading?: boolean
  error?: Error
  screenings?: Array.Array<ScreeningsByFilm>
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
      _command: Command<void, Array.Array<ScreeningsByFilm>>,
    ) {},
    ScreeningsFetchingStarted(state) {
      state.isLoading = true
    },
    ScreeningsNotFetched(state, _event: Event<Error>) {
      state.isLoading = false
      state.error = new ScreeningsNotFetched()
    },
    ScreeningsFetched(state, event: Event<Array.Array<ScreeningsByFilm>>) {
      state.isLoading = false
      state.error = undefined
      state.screenings = event.payload.map(({ screenings, ...entity }) => ({
        ...entity,
        screenings: [...screenings],
      }))
    },
  },
})

export const $ScreeningDashboard = $ScreeningDashboardSlice.actions
