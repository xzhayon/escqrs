import { Array } from '@effect-ts/core'
import { Add } from '@mui/icons-material'
import {
  Box,
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
import React, { FC } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Screening } from '../../../../screening/Screening'

export const ScreeningDashboard: FC = () => {
  const isLoading = false
  const screenings: Array.Array<Screening> | undefined = undefined

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">Screenings</Typography>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 'calc(100% * 2 / 3)' }}>
                      Film
                    </TableCell>
                    <TableCell sx={{ width: 'calc(100% * 1 / 3)' }}>
                      Screen
                    </TableCell>
                    <TableCell align="right">Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(screenings ?? [null, null, null]).map((_screening, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" />
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
          to="create"
          variant="extended"
          sx={{ bottom: 16, position: 'absolute', right: 16 }}
        >
          <Add sx={{ mr: 1 }} /> Screening
        </Fab>
      </Box>
      <Outlet />
      <Snackbar open={isLoading} message="Fetching list of films..." />
    </>
  )
}
