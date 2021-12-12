import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../../../../film/Film'
import { Command, Event } from '../../../Message'

export interface FilmCreationState {
  state?: 'Creating'
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
      state.state = 'Creating'
    },
    NotCreated(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotCreated()
    },
    Created(state, _event: Event<Film>) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $FilmCreation = $FilmCreationSlice.actions

export class NotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotCreated.prototype)
  }
}
