import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../src/entity/Entity'
import { Film } from '../../../../film/Film'
import { Command, Event } from '../../Message'

export interface FilmRemovalState {
  state?: 'FetchingFilm' | 'RemovingFilm'
  error?: Error
  film?: { title: string }
}

const initialState: FilmRemovalState = {}

export const $FilmRemovalSlice = createSlice({
  name: 'FilmRemoval',
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
    removeFilm(_, _command: Command) {},
    FilmRemovalStarted(state) {
      state.state = 'RemovingFilm'
    },
    FilmNotRemoved(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new FilmNotRemoved()
    },
    FilmRemoved(state) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $FilmRemoval = $FilmRemovalSlice.actions

export class FilmNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmNotFetched.prototype)
  }
}

export class FilmNotRemoved extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmNotRemoved.prototype)
  }
}
