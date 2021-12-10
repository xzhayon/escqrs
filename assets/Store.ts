import { configureStore, isPlain } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { $Context } from './Context'
import { $FilmCreationSlice } from './film/creation/slice'
import { $FilmDashboardSlice } from './film/dashboard/slice'
import { $Saga } from './Saga'
import { $ScreenDashboardSlice } from './screen/dashboard/slice'
import { $ScreenRemovalSlice } from './screen/removal/slice'
import { $ScreenCreationSlice } from './screen/upsertion/creation/slice'
import { $ScreenEditingSlice } from './screen/upsertion/editing/slice'

const sagaMiddleware = createSagaMiddleware({ context: $Context })

export const $Store = configureStore({
  reducer: {
    [$ScreenDashboardSlice.name]: $ScreenDashboardSlice.reducer,
    [$ScreenCreationSlice.name]: $ScreenCreationSlice.reducer,
    [$ScreenEditingSlice.name]: $ScreenEditingSlice.reducer,
    [$ScreenRemovalSlice.name]: $ScreenRemovalSlice.reducer,
    [$FilmDashboardSlice.name]: $FilmDashboardSlice.reducer,
    [$FilmCreationSlice.name]: $FilmCreationSlice.reducer,
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
