import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
} from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { $Film } from '../../../app/arcadia/film/Film'
import { use$Dispatch, use$Selector } from '../../Hook'
import { $FilmCreation, $FilmCreationSlice, NotCreated } from './creation/slice'
import {
  $FilmEditing,
  $FilmEditingSlice,
  DetailNotFetched,
  NotEdited,
} from './editing/slice'

export const FilmUpsertion: FC = () => {
  const dispatch = use$Dispatch()
  const navigate = useNavigate()

  const { id } = useParams()
  const isEditing = undefined !== id
  const sliceName = isEditing ? $FilmEditingSlice.name : $FilmCreationSlice.name

  const state = use$Selector((state) => state[sliceName].state)
  const error = use$Selector((state) => state[sliceName].error)
  const film = use$Selector((state) => state[$FilmEditingSlice.name].film)

  const [title, setTitle] = useState<string>()

  useEffect(() => {
    isEditing
      ? dispatch($FilmEditing.Start({ id: $Film.id(id) }))
      : dispatch($FilmCreation.Start())
    return () => {
      isEditing ? dispatch($FilmEditing.Stop()) : dispatch($FilmCreation.Stop())
    }
  }, [])

  return (
    <>
      <Dialog open>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const _title = title ?? film?.title
            if (undefined === _title) {
              return
            }

            const payload = { title: _title, onSuccess: () => navigate(-1) }
            isEditing
              ? dispatch($FilmEditing.Edit(payload))
              : dispatch($FilmCreation.Create(payload))
          }}
        >
          <DialogTitle>{isEditing ? 'Edit film' : 'Create film'}</DialogTitle>
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
                          onClick={() => dispatch($FilmEditing.FetchDetail())}
                        >
                          Retry
                        </Button>
                      ) : null
                    }
                    severity="error"
                  >
                    {error instanceof NotCreated
                      ? 'Cannot create film.'
                      : error instanceof DetailNotFetched
                      ? 'Cannot fetch film detail.'
                      : error instanceof NotEdited
                      ? 'Cannot edit film.'
                      : undefined}
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  disabled={undefined !== state}
                  fullWidth
                  label="Title"
                  name="title"
                  required
                  variant="filled"
                  value={
                    (isEditing && undefined === title ? film?.title : title) ??
                    ''
                  }
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              disabled={undefined !== state}
              type="submit"
            >
              {isEditing ? 'Edit' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={undefined !== state}
        message={
          state &&
          {
            Creating: 'Creating film...',
            FetchingDetail: 'Fetching film detail...',
            Editing: 'Editing film...',
          }[state]
        }
      />
    </>
  )
}
