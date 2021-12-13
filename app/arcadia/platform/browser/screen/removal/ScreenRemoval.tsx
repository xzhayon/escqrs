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
import { $Screen } from '../../../../screen/Screen'
import { use$Dispatch, use$Selector } from '../../Hook'
import { ScreenNotFetched } from '../error/ScreenNotFetched'
import { ScreenNotRemoved } from '../error/ScreenNotRemoved'
import { $ScreenRemoval, $ScreenRemovalSlice } from './slice'

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

    dispatch($ScreenRemoval.start({ id: $Screen.id(id) }))
    return () => {
      dispatch($ScreenRemoval.stop())
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
                    error instanceof ScreenNotFetched ? (
                      <Button
                        color="inherit"
                        disabled={'FetchingScreen' === state}
                        size="small"
                        onClick={() => dispatch($ScreenRemoval.fetchScreen())}
                      >
                        Retry
                      </Button>
                    ) : null
                  }
                  severity="error"
                >
                  {error instanceof ScreenNotFetched
                    ? 'Cannot fetch screen detail.'
                    : error instanceof ScreenNotRemoved
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
              dispatch(
                $ScreenRemoval.removeScreen({ onSuccess: () => navigate(-1) }),
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
            FetchingScreen: 'Fetching screen detail...',
            RemovingScreen: 'Removing screen...',
          }[state]
        }
      />
    </>
  )
}
