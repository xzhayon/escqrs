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
  DetailNotFetched,
  NotRemoved,
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

    dispatch($FilmRemoval.Start({ id: $Film.id(id) }))
    return () => {
      dispatch($FilmRemoval.Stop())
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
                    error instanceof DetailNotFetched ? (
                      <Button
                        color="inherit"
                        disabled={'FetchingDetail' === state}
                        size="small"
                        onClick={() => dispatch($FilmRemoval.FetchDetail())}
                      >
                        Retry
                      </Button>
                    ) : null
                  }
                  severity="error"
                >
                  {error instanceof DetailNotFetched
                    ? 'Cannot fetch film detail.'
                    : error instanceof NotRemoved
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
              dispatch($FilmRemoval.Remove({ onSuccess: () => navigate(-1) }))
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
            FetchingDetail: 'Fetching film detail...',
            Removing: 'Removing film...',
          }[state]
        }
      />
    </>
  )
}
