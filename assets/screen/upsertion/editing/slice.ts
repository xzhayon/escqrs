import { createSlice } from '@reduxjs/toolkit'
import { Screen } from '../../../../app/arcadia/Screen'
import { Id } from '../../../../src/entity/Entity'
import { Command, Event } from '../../../Message'

export interface ScreenEditingState {
  state?: 'FetchingDetail' | 'Editing'
  error?: Error
  screen?: {
    id: Id<Screen>
    name: string
    seats: { rows: number; columns: number }
  }
}

const initialState: ScreenEditingState = {}

export const $ScreenEditingSlice = createSlice({
  name: 'ScreenEditing',
  initialState,
  reducers: {
    Start(_, _command: Command<{ id: Id<Screen> }>) {},
    FetchDetail(_, _command: Command<void, Screen>) {},
    Edit(
      _,
      _command: Command<
        { name: string; seats: { rows: number; columns: number } },
        Screen
      >,
    ) {},
    Stop() {},
    Started() {},
    DetailFetchingStarted(state) {
      state.state = 'FetchingDetail'
    },
    DetailNotFetched(state, event: Event<Error>) {
      state.state = undefined
      state.error = new DetailNotFetched()
    },
    DetailFetched(state, event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
      state.screen = {
        id: event.payload._.id,
        name: event.payload.name,
        seats: event.payload.seats,
      }
    },
    EditingStarted(state) {
      state.state = 'Editing'
    },
    NotEdited(state, _event: Event<Error>) {
      state.state = undefined
      state.error = new NotEdited()
    },
    Edited(state, _event: Event<Screen>) {
      state.state = undefined
      state.error = undefined
    },
    Stopped: () => initialState,
  },
})

export const $ScreenEditing = $ScreenEditingSlice.actions

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
