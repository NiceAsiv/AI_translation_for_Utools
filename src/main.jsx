import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './main.css'
import App from './App.jsx'
import { appleTheme } from './theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={appleTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
)
