import { CssBaseline } from '@mui/material'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router } from './Router'
import { $Store } from './Store'

render(
  <Provider store={$Store}>
    <CssBaseline />
    <Router />
  </Provider>,
  document.getElementById('app'),
)
