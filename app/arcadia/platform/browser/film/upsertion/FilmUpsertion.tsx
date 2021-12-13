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
import { $Film } from '../../../../film/Film'
import { use$Dispatch, use$Selector } from '../../Hook'
import { FilmNotCreated } from '../error/FilmNotCreated'
import { FilmNotEdited } from '../error/FilmNotEdited'
import { FilmNotFetched } from '../error/FilmNotFetched'
import { $FilmCreation, $FilmCreationSlice } from './creation/slice'
import { $FilmEditing, $FilmEditingSlice } from './editing/slice'

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
      ? dispatch($FilmEditing.start({ id: $Film.id(id) }))
      : dispatch($FilmCreation.start())
    return () => {
      isEditing ? dispatch($FilmEditing.stop()) : dispatch($FilmCreation.stop())
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
              ? dispatch($FilmEditing.editFilm(payload))
              : dispatch($FilmCreation.createFilm(payload))
          }}
        >
          <DialogTitle>{isEditing ? 'Edit film' : 'Create film'}</DialogTitle>
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
                          onClick={() => dispatch($FilmEditing.fetchFilm())}
                        >
                          Retry
                        </Button>
                      ) : null
                    }
                    severity="error"
                  >
                    {error instanceof FilmNotCreated
                      ? 'Cannot create film.'
                      : error instanceof FilmNotFetched
                      ? 'Cannot fetch film detail.'
                      : error instanceof FilmNotEdited
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
            CreatingFilm: 'Creating film...',
            FetchingFilm: 'Fetching film detail...',
            EditingFilm: 'Editing film...',
          }[state]
        }
      />
    </>
  )
}
