import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Film } from '../../../../app/arcadia/Film'
import { Screen } from '../../../../app/arcadia/Screen'
import { Screening } from '../../../../app/arcadia/Screening'
import { Id } from '../../../../src/entity/Entity'
import { Command, Event } from '../../../Message'

export interface ScreeningCreationState {
  state?: 'Fetching' | 'Creating'
  error?: Error
  films?: Array.Array<{ id: Id<Film>; title: string }>
  screens?: Array.Array<{ id: Id<Screen>; name: string }>
}

const initialState: ScreeningCreationState = {}

export const $ScreeningCreationSlice = createSlice({
  name: 'ScreeningCreationSlice',
  initialState,
  reducers: {
    Start() {},
    Fetch(
      _,
      _command: Command<
        void,
        { films: Array.Array<Film>; screens: Array.Array<Screen> }
      >,
    ) {},
    Create(
      _,
      _command: Command<
        { filmId: Id<Film>; screenId: Id<Screen>; date: Date },
        Screening
      >,
    ) {},
    Stop() {},
    Started() {},
    FetchingStarted(state) {
      state.state = 'Fetching'
    },
    NotFetched(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotFetched()
    },
    Fetched(
      state,
      event: Event<{ films: Array.Array<Film>; screens: Array.Array<Screen> }>,
    ) {
      state.state = undefined
      state.films = event.payload.films.map(({ _, title }) => ({
        id: _.id,
        title,
      }))
      state.screens = event.payload.screens.map(({ _, name }) => ({
        id: _.id,
        name,
      }))
    },
    CreationStarted(state) {
      state.state = 'Creating'
    },
    NotCreated(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotCreated()
    },
    Created(state, _event: Event<Screening>) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $ScreeningCreation = $ScreeningCreationSlice.actions

export class NotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotFetched.prototype)
  }
}

export class NotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, NotCreated.prototype)
  }
}
