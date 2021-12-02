import {
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
import { useNavigate } from 'react-router'
import { FilmCreation } from './FilmCreationSlice'
import { use$Dispatch, use$Selector } from './Hook'

export const NewFilm: FC = () => {
  const dispatch = use$Dispatch()
  const navigate = useNavigate()

  const isLoading = use$Selector((state) => state.FilmCreation.isLoading)

  const [title, setTitle] = useState<string>('')

  useEffect(() => {
    dispatch(FilmCreation.Start())
    return () => {
      dispatch(FilmCreation.Stop())
    }
  }, [])

  return (
    <>
      <Dialog open>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            dispatch(
              FilmCreation.Create({
                title,
                onSuccess: () => navigate(-1),
              }),
            )
          }}
        >
          <DialogTitle>Create film</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  disabled={isLoading}
                  fullWidth
                  label="Title"
                  name="title"
                  required
                  variant="filled"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" disabled={isLoading} type="submit">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar open={isLoading} message="Creating film..." />
    </>
  )
}
