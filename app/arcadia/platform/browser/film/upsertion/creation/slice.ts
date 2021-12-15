import { createSlice } from '@reduxjs/toolkit'
import { Command, Event } from '../../../Message'
import { FilmCreationRejected } from '../../error/FilmCreationRejected'

export interface FilmCreationState {
  state?: 'CreatingFilm'
  error?: Error
}

const initialState: FilmCreationState = {}

export const $FilmCreationSlice = createSlice({
  name: 'FilmCreation',
  initialState,
  reducers: {
    start() {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    createFilm(_, _command: Command<{ title: string }>) {},
    FilmCreationRequested(state) {
      state.state = 'CreatingFilm'
    },
    FilmCreationRejected(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new FilmCreationRejected()
    },
    FilmCreationAccepted(state) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $FilmCreation = $FilmCreationSlice.actions
