import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../src/entity/Entity'
import { Film } from '../../../../film/Film'
import { Command, Event } from '../../Message'

export interface FilmRemovalState {
  state?: 'FetchingDetail' | 'Removing'
  error?: Error
  film?: { title: string }
}

const initialState: FilmRemovalState = {}

export const $FilmRemovalSlice = createSlice({
  name: 'FilmRemoval',
  initialState,
  reducers: {
    Start(_, _command: Command<{ id: Id<Film> }>) {},
    FetchDetail(_, _command: Command<void, Film>) {},
    Remove(_, _command: Command) {},
    Stop() {},
    Started() {},
    DetailFetchingStarted(state) {
      state.state = 'FetchingDetail'
    },
    DetailNotFetched(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new DetailNotFetched()
    },
    DetailFetched(state, event: Event<Film>) {
      state.state = undefined
      state.error = undefined
      state.film = { title: event.payload.title }
    },
    RemovalStarted(state) {
      state.state = 'Removing'
    },
    NotRemoved(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotRemoved()
    },
    Removed(state) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $FilmRemoval = $FilmRemovalSlice.actions

export class DetailNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, DetailNotFetched.prototype)
  }
}

export class NotRemoved extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotRemoved.prototype)
  }
}
