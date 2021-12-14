import { Add } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Fab,
  Grid,
  Paper,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  })

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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 'calc(100% * 2 / 3)' }}>
                      Film
                    </TableCell>
                    <TableCell sx={{ width: 'calc(100% * 1 / 3)' }}>
                      Screen
                    </TableCell>
                    <TableCell align="right">Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(screenings ?? [null, null, null]).map((screening, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {screening?.filmName ?? <Skeleton variant="text" />}
                      </TableCell>
                      <TableCell>
                        {screening?.screenName ?? <Skeleton variant="text" />}
                      </TableCell>
                      <TableCell>
                        {screening?.date.toISOString() ?? (
                          <Skeleton variant="text" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
