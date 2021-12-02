import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../app/arcadia/Film'
import { Command, Event } from './Message'

export interface FilmCreationState {
  isLoading?: boolean
  error?: Error
}

const initialState: FilmCreationState = {}

export const $FilmCreationSlice = createSlice({
  name: 'FilmCreation',
  initialState,
  reducers: {
    Start() {},
    Create(_, _command: Command<{ title: string }, Film>) {},
    Stop() {},
    Started() {},
    CreationStarted(state) {
      state.isLoading = true
    },
    NotCreated(state, event: Event<Error>) {
      state.isLoading = false
      state.error = event.payload
    },
    Created(state, _event: Event<Film>) {
      state.isLoading = false
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const FilmCreation = $FilmCreationSlice.actions
