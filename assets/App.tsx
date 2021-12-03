import React, { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FilmDashboard } from './film/dashboard/FilmList'
import { Layout } from './Layout'
import { FilmCreation } from './film/creation/FilmCreation'
import { ScreenCreation } from './screen/creation/ScreenCreation'
import { ScreenDashboard } from './screen/dashboard/ScreenDashboard'

export const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="screens" element={<ScreenDashboard />}>
          <Route path="create" element={<ScreenCreation />} />
        </Route>
        <Route path="films" element={<FilmDashboard />}>
          <Route path="create" element={<FilmCreation />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
