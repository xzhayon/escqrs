import { Array } from '@effect-ts/core'
import { createSlice } from '@reduxjs/toolkit'
import { Id } from '../../../../../../../src/entity/Entity'
import { Film } from '../../../../../film/Film'
import { Screen } from '../../../../../screen/Screen'
import { FilmsAndScreensNotFetched } from '../../../error/FilmsAndScreensNotFetched'
import { Command, Event } from '../../../Message'
import { ScreeningCreationRejected } from '../../error/ScreeningCreationRejected'

export interface ScreeningCreationState {
  state?: 'FetchingFilmsAndScreens' | 'CreatingScreening'
  error?: Error
  films?: Array.Array<{ id: Id<Film>; title: string }>
  screens?: Array.Array<{ id: Id<Screen>; name: string }>
}

const initialState: ScreeningCreationState = {}

export const $ScreeningCreationSlice = createSlice({
  name: 'ScreeningCreation',
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
      state.error = undefined
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
    ScreeningCreationRequested(state) {
      state.state = 'CreatingScreening'
    },
    ScreeningCreationRejected(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new ScreeningCreationRejected()
    },
    ScreeningCreationAccepted(state) {
      state.state = undefined
      state.error = undefined
    },
  },
})

export const $ScreeningCreation = $ScreeningCreationSlice.actions
