import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../src/entity/Entity'
import { Film } from '../../../../film/Film'
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
    start() {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    fetchFilms(_, _command: Command<void, Array.Array<Film>>) {},
    FilmsFetchingStarted(state) {
      state.isLoading = true
    },
    FilmsNotFetched(state, _event: Event<Error>) {
      state.isLoading = false
      state.error = new FilmsNotFetched()
    },
    FilmsFetched(state, event: Event<Array.Array<Film>>) {
      state.isLoading = false
      state.error = undefined
      state.films = event.payload.map((film) => ({
        id: film._.id,
        title: film.title,
      }))
    },
  },
})

export const $FilmDashboard = $FilmDashboardSlice.actions

export class FilmsNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmsNotFetched.prototype)
  }
}
