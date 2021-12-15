import { Add } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Fab,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material'
import React, { FC, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { use$Dispatch, use$Selector } from '../../Hook'
import { $ScreeningDashboard, $ScreeningDashboardSlice } from './slice'

export const ScreeningDashboard: FC = () => {
  const dispatch = use$Dispatch()

  const isLoading = use$Selector(
    (state) => state[$ScreeningDashboardSlice.name].isLoading,
  )
  const error = use$Selector(
    (state) => state[$ScreeningDashboardSlice.name].error,
  )
  const screenings = use$Selector(
    (state) => state[$ScreeningDashboardSlice.name].screenings,
  )

  useEffect(() => {
    dispatch($ScreeningDashboard.start())
    return () => {
      dispatch($ScreeningDashboard.stop())
    }
  }, [])

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">Screenings</Typography>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert
                action={
                  <Button
                    color="inherit"
                    disabled={isLoading}
                    size="small"
                    onClick={() =>
                      dispatch($ScreeningDashboard.fetchScreenings())
                    }
                  >
                    Retry
                  </Button>
                }
                severity="error"
              >
                Cannot fetch screenings.
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <List sx={{ '& ul': { padding: 0 } }}>
              {(screenings || [null, null, null]).map((entity, i) => (
                <li key={i}>
                  <ul>
                    <ListSubheader>
                      {entity?.filmTitle ?? <Skeleton variant="text" />}
                    </ListSubheader>
                    {(entity?.screenings || [null, null, null]).map(
                      (screening, j) => (
                        <ListItem key={j}>
                          <ListItemText
                            primary={
                              screening?.date.toISOString() ?? (
                                <Skeleton variant="text" />
                              )
                            }
                            secondary={
                              screening ? (
                                <>
                                  <Typography
                                    color="text.primary"
                                    component="span"
                                    sx={{ display: 'inline' }}
                                    variant="body2"
                                  >
                                    {screening.screenName}
                                  </Typography>{' '}
                                  - {screening.seats.free}/
                                  {screening.seats.total} seats
                                </>
                              ) : (
                                <Skeleton variant="text" />
                              )
                            }
                          />
                        </ListItem>
                      ),
                    )}
                  </ul>
                </li>
              ))}
            </List>
          </Grid>
        </Grid>
        <Fab
          color="primary"
          component={Link}
          disabled={isLoading}
          to="create"
          variant="extended"
          sx={{ bottom: 16, position: 'absolute', right: 16 }}
        >
          <Add sx={{ mr: 1 }} /> Screening
        </Fab>
      </Box>
      <Outlet />
      <Snackbar open={isLoading} message="Fetching screenings..." />
    </>
  )
}
