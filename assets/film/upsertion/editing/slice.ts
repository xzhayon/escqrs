import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../../../app/arcadia/Film'
import { Id } from '../../../../src/entity/Entity'
import { Command, Event } from '../../../Message'

export interface FilmEditingState {
  state?: 'FetchingDetail' | 'Editing'
  error?: Error
  film?: { id: Id<Film>; title: string }
}

const initialState: FilmEditingState = {}

export const $FilmEditingSlice = createSlice({
  name: 'FilmEditing',
  initialState,
  reducers: {
    Start(_, _command: Command<{ id: Id<Film> }>) {},
    FetchDetail(_, _command: Command<void, Film>) {},
    Edit(_, _command: Command<{ title: string }, Film>) {},
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
      state.film = { id: event.payload._.id, title: event.payload.title }
    },
    EditingStarted(state) {
      state.state = 'Editing'
    },
    NotEdited(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotEdited()
    },
    Edited(state, _event: Event<Film>) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $FilmEditing = $FilmEditingSlice.actions

export class DetailNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, DetailNotFetched.prototype)
  }
}

export class NotEdited extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotEdited.prototype)
  }
}
