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
import { Outlet } from 'react-router'
import { Link } from 'react-router-dom'
import { $FilmDashboard, $FilmDashboardSlice } from './slice'
import { use$Dispatch, use$Selector } from '../../Hook'

export const FilmDashboard: FC = () => {
  const dispatch = use$Dispatch()

  const isLoading = use$Selector(
    (state) => state[$FilmDashboardSlice.name].isLoading,
  )
  const error = use$Selector((state) => state[$FilmDashboardSlice.name].error)
  const films = use$Selector((state) => state[$FilmDashboardSlice.name].films)

  useEffect(() => {
    dispatch($FilmDashboard.Start())
    return () => {
      dispatch($FilmDashboard.Stop())
    }
  }, [])

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">Films</Typography>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert
                action={
                  <Button
                    color="inherit"
                    disabled={isLoading}
                    size="small"
                    onClick={() => dispatch($FilmDashboard.FetchList())}
                  >
                    Retry
                  </Button>
                }
                severity="error"
              >
                Cannot fetch list of films.
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(films ?? [null, null, null]).map((film, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {film ? film.title : <Skeleton variant="text" />}
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
          <Add sx={{ mr: 1 }} /> Film
        </Fab>
      </Box>
      <Outlet />
      <Snackbar open={isLoading} message="Fetching list of films..." />
    </>
  )
}
