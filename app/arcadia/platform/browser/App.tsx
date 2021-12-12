import React, { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FilmDashboard } from './film/dashboard/FilmDashboard'
import { FilmRemoval } from './film/removal/FilmRemoval'
import { FilmUpsertion } from './film/upsertion/FilmUpsertion'
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
          <Route path=":id">
            <Route path="edit" element={<ScreenUpsertion />} />
            <Route path="remove" element={<ScreenRemoval />} />
          </Route>
        </Route>
        <Route path="films" element={<FilmDashboard />}>
          <Route path="create" element={<FilmUpsertion />} />
          <Route path=":id">
            <Route path="edit" element={<FilmUpsertion />} />
            <Route path="remove" element={<FilmRemoval />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
