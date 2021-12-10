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
import { $Screen } from '../../../app/arcadia/Screen'
import { use$Dispatch, use$Selector } from '../../Hook'
import {
  $ScreenRemoval,
  $ScreenRemovalSlice,
  DetailNotFetched,
  NotRemoved,
} from './slice'

export const ScreenRemoval: FC = () => {
  const dispatch = use$Dispatch()
  const navigate = useNavigate()

  const { id } = useParams()

  const state = use$Selector((state) => state[$ScreenRemovalSlice.name].state)
  const error = use$Selector((state) => state[$ScreenRemovalSlice.name].error)
  const screen = use$Selector((state) => state[$ScreenRemovalSlice.name].screen)

  useEffect(() => {
    if (undefined === id) {
      return
    }

    dispatch($ScreenRemoval.Start({ id: $Screen.id(id) }))
    return () => {
      dispatch($ScreenRemoval.Stop())
    }
  }, [])

  return (
    <>
      <Dialog open>
        <DialogTitle>Remove screen</DialogTitle>
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
                        onClick={() => dispatch($ScreenRemoval.FetchDetail())}
                      >
                        Retry
                      </Button>
                    ) : null
                  }
                  severity="error"
                >
                  {error instanceof DetailNotFetched
                    ? 'Cannot fetch screen detail.'
                    : error instanceof NotRemoved
                    ? 'Cannot remove screen.'
                    : undefined}
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <DialogContentText>
                {screen ? (
                  `Are you sure you want to remove screen "${screen?.name}"?`
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
              dispatch($ScreenRemoval.Remove({ onSuccess: () => navigate(-1) }))
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
            FetchingDetail: 'Fetching screen detail...',
            Removing: 'Removing screen...',
          }[state]
        }
      />
    </>
  )
}
