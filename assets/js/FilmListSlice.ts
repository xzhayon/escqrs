import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../app/arcadia/Film'
import { Id } from '../../src/Entity'
import { Command, Event } from './Message'

export interface FilmListState {
  isLoading?: boolean
  error?: Error
  films?: Array.Array<{ id: Id<Film>; title: string }>
}

const initialState: FilmListState = {}

export const $FilmListSlice = createSlice({
  name: 'FilmList',
  initialState,
  reducers: {
    Start() {},
    Fetch(_, _command: Command<void, Array.Array<Film>>) {},
    Stop() {},
    Started() {},
    FetchStarted(state) {
      state.isLoading = true
    },
    NotFetched(state, event: Event<Error>) {
      state.isLoading = false
      state.error = event.payload
    },
    Fetched(state, event: Event<Array.Array<Film>>) {
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

export const FilmList = $FilmListSlice.actions
