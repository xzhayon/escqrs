import React, { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FilmCreation } from './film/creation/FilmCreation'
import { FilmDashboard } from './film/dashboard/FilmList'
import { Layout } from './Layout'
import { ScreenDashboard } from './screen/dashboard/ScreenDashboard'
import { ScreenRemoval } from './screen/removal/ScreenRemoval'
import { ScreenUpsertion } from './screen/upsertion/ScreenUpsertion'

export const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="screens" element={<ScreenDashboard />}>
          <Route path="create" element={<ScreenUpsertion />} />
          <Route path=":id/edit" element={<ScreenUpsertion />} />
          <Route path=":id/remove" element={<ScreenRemoval />} />
        </Route>
        <Route path="films" element={<FilmDashboard />}>
          <Route path="create" element={<FilmCreation />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
