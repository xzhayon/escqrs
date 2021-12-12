import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../../src/entity/Entity'
import { Film } from '../../../../../film/Film'
import { Screen } from '../../../../../screen/Screen'
import { Command, Event } from '../../../Message'

export interface ScreeningCreationState {
  state?: 'FetchingFilmsAndScreens' | 'CreatingScreening'
  error?: Error
  films?: Array.Array<{ id: Id<Film>; title: string }>
  screens?: Array.Array<{ id: Id<Screen>; name: string }>
}

const initialState: ScreeningCreationState = {}

export const $ScreeningCreationSlice = createSlice({
  name: 'ScreeningCreationSlice',
  initialState,
  reducers: {
    start() {},
    Started() {},
    stop() {},
    Stopped: () => initialState,
    fetchFilmsAndScreens(
      _,
      _command: Command<
        void,
        { films: Array.Array<Film>; screens: Array.Array<Screen> }
      >,
    ) {},
    FilmsAndScreensFetchingStarted(state) {
      state.state = 'FetchingFilmsAndScreens'
    },
    FilmsAndScreensNotFetched(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new FilmsAndScreensNotFetched()
    },
    FilmsAndScreensFetched(
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
    createScreening(
      _,
      _command: Command<{ filmId: Id<Film>; screenId: Id<Screen>; date: Date }>,
    ) {},
    ScreeningCreationStarted(state) {
      state.state = 'CreatingScreening'
    },
    ScreeningNotCreated(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new ScreeningNotCreated()
    },
    ScreeningCreated(state, _event: Event) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $ScreeningCreation = $ScreeningCreationSlice.actions

export class FilmsAndScreensNotFetched extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, FilmsAndScreensNotFetched.prototype)
  }
}

export class ScreeningNotCreated extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, ScreeningNotCreated.prototype)
  }
}
