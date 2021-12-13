import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../../../../film/Film'
import { Command, Event } from '../../../Message'
import { FilmNotCreated } from '../../error/FilmNotCreated'

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
    createFilm(_, _command: Command<{ title: string }, Film>) {},
    FilmCreationStarted(state) {
      state.state = 'CreatingFilm'
    },
    FilmNotCreated(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new FilmNotCreated()
    },
    FilmCreated(state, _event: Event<Film>) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $FilmCreation = $FilmCreationSlice.actions
