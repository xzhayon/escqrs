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
import { $Screen } from '../../../app/arcadia/screen/Screen'
import { use$Dispatch, use$Selector } from '../../Hook'
import {
  $ScreenCreation,
  $ScreenCreationSlice,
  NotCreated,
} from './creation/slice'
import {
  $ScreenEditing,
  $ScreenEditingSlice,
  DetailNotFetched,
  NotEdited,
} from './editing/slice'

export const ScreenUpsertion: FC = () => {
  const dispatch = use$Dispatch()
  const navigate = useNavigate()

  const { id } = useParams()
  const isEditing = undefined !== id
  const sliceName = isEditing
    ? $ScreenEditingSlice.name
    : $ScreenCreationSlice.name

  const state = use$Selector((state) => state[sliceName].state)
  const error = use$Selector((state) => state[sliceName].error)
  const screen = use$Selector((state) => state[$ScreenEditingSlice.name].screen)

  const [name, setName] = useState<string>()
  const [rows, setRows] = useState<number>()
  const [columns, setColumns] = useState<number>()

  useEffect(() => {
    isEditing
      ? dispatch($ScreenEditing.Start({ id: $Screen.id(id) }))
      : dispatch($ScreenCreation.Start())
    return () => {
      isEditing
        ? dispatch($ScreenEditing.Stop())
        : dispatch($ScreenCreation.Stop())
    }
  }, [])

  return (
    <>
      <Dialog open>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const _name = name ?? screen?.name
            const _rows = rows ?? screen?.seats.rows
            const _columns = columns ?? screen?.seats.columns
            if (
              undefined === _name ||
              undefined === _rows ||
              undefined === _columns
            ) {
              return
            }

            const payload = {
              name: _name,
              seats: { rows: _rows, columns: _columns },
              onSuccess: () => navigate(-1),
            }
            isEditing
              ? dispatch($ScreenEditing.Edit(payload))
              : dispatch($ScreenCreation.Create(payload))
          }}
        >
          <DialogTitle>
            {isEditing ? 'Edit screen' : 'Create screen'}
          </DialogTitle>
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
                          onClick={() => dispatch($ScreenEditing.FetchDetail())}
                        >
                          Retry
                        </Button>
                      ) : null
                    }
                    severity="error"
                  >
                    {error instanceof NotCreated
                      ? 'Cannot create screen.'
                      : error instanceof DetailNotFetched
                      ? 'Cannot fetch screen detail.'
                      : error instanceof NotEdited
                      ? 'Cannot edit screen.'
                      : undefined}
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  disabled={undefined !== state}
                  fullWidth
                  label="Name"
                  name="name"
                  required
                  variant="filled"
                  value={
                    (isEditing && undefined === name ? screen?.name : name) ??
                    ''
                  }
                  onChange={(event) => setName(event.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  disabled={undefined !== state}
                  fullWidth
                  inputProps={{ min: 1, max: 1000 }}
                  label="Rows"
                  name="rows"
                  required
                  type="number"
                  variant="filled"
                  value={
                    (isEditing && undefined === rows
                      ? screen?.seats.rows
                      : isFinite(rows ?? NaN)
                      ? rows
                      : '') ?? ''
                  }
                  onChange={(event) =>
                    isFinite(Number(event.target.value)) &&
                    setRows(Number(event.target.value))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  disabled={undefined !== state}
                  fullWidth
                  inputProps={{ min: 1, max: 1000 }}
                  label="Columns"
                  name="columns"
                  required
                  type="number"
                  variant="filled"
                  value={
                    (isEditing && undefined === columns
                      ? screen?.seats.columns
                      : isFinite(columns ?? NaN)
                      ? columns
                      : '') ?? ''
                  }
                  onChange={(event) =>
                    isFinite(Number(event.target.value)) &&
                    setColumns(Number(event.target.value))
                  }
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
            Creating: 'Creating screen...',
            FetchingDetail: 'Fetching screen detail...',
            Editing: 'Editing screen...',
          }[state]
        }
      />
    </>
  )
}
