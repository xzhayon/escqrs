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
import { use$Dispatch, use$Selector } from './Hook'
import { ScreenCreation } from './ScreenCreationSlice'

export const NewScreen: FC = () => {
  const dispatch = use$Dispatch()
  const navigate = useNavigate()

  const isLoading = use$Selector((state) => state.ScreenCreation.isLoading)

  const [name, setName] = useState<string>('')
  const [rows, setRows] = useState<number>(NaN)
  const [columns, setColumns] = useState<number>(NaN)

  useEffect(() => {
    dispatch(ScreenCreation.Start())
    return () => {
      dispatch(ScreenCreation.Stop())
    }
  }, [])

  return (
    <>
      <Dialog open>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            dispatch(
              ScreenCreation.Create({
                name,
                seats: { rows, columns },
                onSuccess: () => navigate(-1),
              }),
            )
          }}
        >
          <DialogTitle>Create screen</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  disabled={isLoading}
                  fullWidth
                  label="Name"
                  name="name"
                  required
                  variant="filled"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  disabled={isLoading}
                  fullWidth
                  inputProps={{ min: 1, max: 1000 }}
                  label="Rows"
                  name="rows"
                  required
                  type="number"
                  variant="filled"
                  value={isFinite(rows) ? rows : ''}
                  onChange={(event) =>
                    isFinite(Number(event.target.value)) &&
                    setRows(Number(event.target.value))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  disabled={isLoading}
                  fullWidth
                  inputProps={{ min: 1, max: 1000 }}
                  label="Columns"
                  name="columns"
                  required
                  type="number"
                  variant="filled"
                  value={isFinite(columns) ? columns : ''}
                  onChange={(event) =>
                    isFinite(Number(event.target.value)) &&
                    setColumns(Number(event.target.value))
                  }
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
      <Snackbar open={isLoading} message="Creating screen..." />
    </>
  )
}
