import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Skeleton,
  Snackbar,
} from '@mui/material'
import React, { FC, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { $Film } from '../../../../film/Film'
import { use$Dispatch, use$Selector } from '../../Hook'
import {
  $FilmRemoval,
  $FilmRemovalSlice,
  FilmNotFetched,
  FilmNotRemoved,
} from './slice'

export const FilmRemoval: FC = () => {
  const dispatch = use$Dispatch()
  const navigate = useNavigate()

  const { id } = useParams()

  const state = use$Selector((state) => state[$FilmRemovalSlice.name].state)
  const error = use$Selector((state) => state[$FilmRemovalSlice.name].error)
  const film = use$Selector((state) => state[$FilmRemovalSlice.name].film)

  useEffect(() => {
    if (undefined === id) {
      return
    }

    dispatch($FilmRemoval.start({ id: $Film.id(id) }))
    return () => {
      dispatch($FilmRemoval.stop())
    }
  }, [])

  return (
    <>
      <Dialog open>
        <DialogTitle>Remove film</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {error && (
              <Grid item xs={12}>
                <Alert
                  action={
                    error instanceof FilmNotFetched ? (
                      <Button
                        color="inherit"
                        disabled={'FetchingFilm' === state}
                        size="small"
                        onClick={() => dispatch($FilmRemoval.fetchFilm())}
                      >
                        Retry
                      </Button>
                    ) : null
                  }
                  severity="error"
                >
                  {error instanceof FilmNotFetched
                    ? 'Cannot fetch film detail.'
                    : error instanceof FilmNotRemoved
                    ? 'Cannot remove film.'
                    : undefined}
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <DialogContentText>
                {film ? (
                  `Are you sure you want to remove film "${film?.title}"?`
                ) : (
                  <Skeleton variant="text" />
                )}
              </DialogContentText>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={undefined !== state}
            onClick={() =>
              dispatch(
                $FilmRemoval.removeFilm({ onSuccess: () => navigate(-1) }),
              )
            }
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={undefined !== state}
        message={
          state &&
          {
            FetchingFilm: 'Fetching film detail...',
            RemovingFilm: 'Removing film...',
          }[state]
        }
      />
    </>
  )
}
