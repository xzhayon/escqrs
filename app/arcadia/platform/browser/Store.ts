import { configureStore, isPlain } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { $Context } from './Context'
import { $FilmDashboardSlice } from './film/dashboard/slice'
import { $FilmRemovalSlice } from './film/removal/slice'
import { $FilmCreationSlice } from './film/upsertion/creation/slice'
import { $FilmEditingSlice } from './film/upsertion/editing/slice'
import { $Saga } from './Saga'
import { $ScreenDashboardSlice } from './screen/dashboard/slice'
import { $ScreenRemovalSlice } from './screen/removal/slice'
import { $ScreenCreationSlice } from './screen/upsertion/creation/slice'
import { $ScreenEditingSlice } from './screen/upsertion/editing/slice'
import { $ScreeningCreationSlice } from './screening/upsertion/creation/slice'

const sagaMiddleware = createSagaMiddleware({ context: $Context })

export const $Store = configureStore({
  reducer: {
    [$ScreenDashboardSlice.name]: $ScreenDashboardSlice.reducer,
    [$ScreenCreationSlice.name]: $ScreenCreationSlice.reducer,
    [$ScreenEditingSlice.name]: $ScreenEditingSlice.reducer,
    [$ScreenRemovalSlice.name]: $ScreenRemovalSlice.reducer,
    [$FilmDashboardSlice.name]: $FilmDashboardSlice.reducer,
    [$FilmCreationSlice.name]: $FilmCreationSlice.reducer,
    [$FilmEditingSlice.name]: $FilmEditingSlice.reducer,
    [$FilmRemovalSlice.name]: $FilmRemovalSlice.reducer,
    [$ScreeningCreationSlice.name]: $ScreeningCreationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.onFailure', 'payload.onSuccess'],
        isSerializable: (value: unknown) =>
          value instanceof Date ? true : isPlain(value),
      },
    }).concat(sagaMiddleware),
})

sagaMiddleware.run($Saga)
