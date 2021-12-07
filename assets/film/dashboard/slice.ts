import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../../app/arcadia/Film'
import { Id } from '../../../src/Entity'
import { Command, Event } from '../../Message'

export interface FilmDashboardState {
  isLoading?: boolean
  error?: Error
  films?: Array.Array<{ id: Id<Film>; title: string }>
}

const initialState: FilmDashboardState = {}

export const $FilmDashboardSlice = createSlice({
  name: 'FilmDashboard',
  initialState,
  reducers: {
    Start() {},
    FetchList(_, _command: Command<void, Array.Array<Film>>) {},
    Stop() {},
    Started() {},
    ListFetchingStarted(state) {
      state.isLoading = true
    },
    ListNotFetched(state, event: Event<Error>) {
      state.isLoading = false
      state.error = event.payload
    },
    ListFetched(state, event: Event<Array.Array<Film>>) {
      state.isLoading = false
      state.error = undefined
      state.films = event.payload.map((film) => ({
        id: film._.id,
        title: film.title,
      }))
    },
    Stopped: () => initialState,
  },
})

export const $FilmDashboard = $FilmDashboardSlice.actions