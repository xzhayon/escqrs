import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import {
  Drawer as MuiDrawer,
  DrawerProps,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

export const Drawer: FC<DrawerProps> = (props) => {
  return (
    <MuiDrawer {...props}>
      {props.children}
      <List>
        <ListItem button component={Link} to="/screens">
          <ListItemText primary="Screens" />
        </ListItem>
        <ListItem button component={Link} to="/films">
          <ListItemText primary="Films" />
        </ListItem>
      </List>
    </MuiDrawer>
  )
}
