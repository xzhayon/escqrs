import { Menu } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import React, { FC, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Drawer } from './Drawer'

const DRAWER_WIDTH = 256

export const Layout: FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false)

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen)

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          ml: { sm: `${DRAWER_WIDTH}px` },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ display: { sm: 'none' }, mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography
            component="div"
            noWrap
            variant="h6"
            sx={{ display: { sm: 'none' } }}
          >
            Arcadia
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ flexShrink: { sm: 0 }, width: { sm: DRAWER_WIDTH } }}
      >
        <Drawer
          ModalProps={{ keepMounted: true }}
          container={document.body}
          open={isDrawerOpen}
          variant="temporary"
          onClose={toggleDrawer}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        />
        <Drawer
          open
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Arcadia
            </Typography>
          </Toolbar>
          <Divider />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
