import { Add, Delete, Edit } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Fab,
  Grid,
  IconButton,
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
import { Outlet } from 'react-router'
import { Link } from 'react-router-dom'
import { use$Dispatch, use$Selector } from '../../Hook'
import { $ScreenDashboard, $ScreenDashboardSlice } from './slice'

export const ScreenDashboard: FC = () => {
  const dispatch = use$Dispatch()

  const isLoading = use$Selector(
    (state) => state[$ScreenDashboardSlice.name].isLoading,
  )
  const error = use$Selector((state) => state[$ScreenDashboardSlice.name].error)
  const screens = use$Selector(
    (state) => state[$ScreenDashboardSlice.name].screens,
  )

  useEffect(() => {
    dispatch($ScreenDashboard.Start())
    return () => {
      dispatch($ScreenDashboard.Stop())
    }
  }, [])

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">Screens</Typography>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert
                action={
                  <Button
                    color="inherit"
                    disabled={isLoading}
                    size="small"
                    onClick={() => dispatch($ScreenDashboard.FetchList())}
                  >
                    Retry
                  </Button>
                }
                severity="error"
              >
                Cannot fetch list of screens.
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 'calc(100% * 2 / 3)' }}>
                      Name
                    </TableCell>
                    <TableCell align="right">Seats</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(screens ?? [null, null, null]).map((screen, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {screen ? screen.name : <Skeleton variant="text" />}
                      </TableCell>
                      <TableCell align="right">
                        {screen ? screen.seats : <Skeleton variant="text" />}
                      </TableCell>
                      <TableCell align="right">
                        {screen && (
                          <IconButton
                            component={Link}
                            disabled={isLoading}
                            to={`${screen.id}/edit`}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {screen && (
                          <IconButton
                            component={Link}
                            disabled={isLoading}
                            to={`${screen.id}/remove`}
                          >
                            <Delete />
                          </IconButton>
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
          <Add sx={{ mr: 1 }} /> Screen
        </Fab>
      </Box>
      <Outlet />
      <Snackbar open={isLoading} message="Fetching list of screens..." />
    </>
  )
}
