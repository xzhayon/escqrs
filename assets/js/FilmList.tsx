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
import { FilmList } from './FilmListSlice'
import { use$Dispatch, use$Selector } from './Hook'

export const FilmListUI: FC = () => {
  const dispatch = use$Dispatch()

  const isLoading = use$Selector((state) => state.FilmList.isLoading)
  const error = use$Selector((state) => state.FilmList.error)
  const films = use$Selector((state) => state.FilmList.films)

  useEffect(() => {
    dispatch(FilmList.Start())
    return () => {
      dispatch(FilmList.Stop())
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
                    onClick={() => dispatch(FilmList.Fetch())}
                  >
                    Retry
                  </Button>
                }
                severity="error"
              >
                Cannot update list of films.
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
          to="new"
          variant="extended"
          sx={{ bottom: 16, position: 'absolute', right: 16 }}
        >
          <Add sx={{ mr: 1 }} /> Film
        </Fab>
      </Box>
      <Outlet />
      <Snackbar open={isLoading} message="Updating list of films..." />
    </>
  )
}
