import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../../src/entity/Entity'
import { Film } from '../../../../../film/Film'
import { Command, Event } from '../../../Message'
import { FilmEditingRejected } from '../../error/FilmEditingRejected'
import { FilmNotFetched } from '../../error/FilmNotFetched'

export interface FilmEditingState {
  state?: 'FetchingFilm' | 'EditingFilm'
  error?: Error
  film?: { title: string }
}

const initialState: FilmEditingState = {}

export const $FilmEditingSlice = createSlice({
  name: 'FilmEditing',
  initialState,
  reducers: {
    start(_, _command: Command<{ id: Id<Film> }>) {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    fetchFilm(_, _command: Command<void, Film>) {},
    FilmFetchingStarted(state) {
      state.state = 'FetchingFilm'
    },
    FilmNotFetched(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new FilmNotFetched()
    },
    FilmFetched(state, event: Event<Film>) {
      state.state = undefined
      state.error = undefined
      state.film = { title: event.payload.title }
    },
    editFilm(_, _command: Command<{ title: string }>) {},
    FilmEditingRequested(state) {
      state.state = 'EditingFilm'
    },
    FilmEditingRejected(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new FilmEditingRejected()
    },
    FilmEditingAccepted(state) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $FilmEditing = $FilmEditingSlice.actions
