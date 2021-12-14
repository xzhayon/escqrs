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
import { $FilmDashboard, $FilmDashboardSlice } from './slice'

export const FilmDashboard: FC = () => {
  const dispatch = use$Dispatch()

  const isLoading = use$Selector(
    (state) => state[$FilmDashboardSlice.name].isLoading,
  )
  const error = use$Selector((state) => state[$FilmDashboardSlice.name].error)
  const films = use$Selector((state) => state[$FilmDashboardSlice.name].films)

  useEffect(() => {
    dispatch($FilmDashboard.start())
    return () => {
      dispatch($FilmDashboard.stop())
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
                    onClick={() => dispatch($FilmDashboard.fetchFilms())}
                  >
                    Retry
                  </Button>
                }
                severity="error"
              >
                Cannot fetch films.
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '100%' }}>Title</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(films ?? [null, null, null]).map((film, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {film ? film.title : <Skeleton variant="text" />}
                      </TableCell>
                      <TableCell align="right">
                        {film && (
                          <IconButton
                            component={Link}
                            disabled={isLoading}
                            to={`${film.id}/edit`}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {film && (
                          <IconButton
                            component={Link}
                            disabled={isLoading}
                            to={`${film.id}/remove`}
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
          <Add sx={{ mr: 1 }} /> Film
        </Fab>
      </Box>
      <Outlet />
      <Snackbar open={isLoading} message="Fetching films..." />
    </>
  )
}
