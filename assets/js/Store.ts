import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { $Context } from './Context'
import { $FilmCreationSlice } from './FilmCreationSlice'
import { $FilmListSlice } from './FilmListSlice'
import { $Saga } from './Saga'
import { $ScreenCreationSlice } from './ScreenCreationSlice'
import { $ScreenListSlice } from './ScreenListSlice'

const sagaMiddleware = createSagaMiddleware({ context: $Context })

export const $Store = configureStore({
  reducer: {
    [$FilmListSlice.name]: $FilmListSlice.reducer,
    [$FilmCreationSlice.name]: $FilmCreationSlice.reducer,
    [$ScreenListSlice.name]: $ScreenListSlice.reducer,
    [$ScreenCreationSlice.name]: $ScreenCreationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
})

sagaMiddleware.run($Saga)
