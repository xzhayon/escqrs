import React, { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FilmListUI } from './FilmList'
import { Layout } from './Layout'
import { NewFilm } from './NewFilm'
import { NewScreen } from './NewScreen'
import { ScreenListUI } from './ScreenList'

export const Router: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="screens" element={<ScreenListUI />}>
          <Route path="new" element={<NewScreen />} />
        </Route>
        <Route path="films" element={<FilmListUI />}>
          <Route path="new" element={<NewFilm />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
