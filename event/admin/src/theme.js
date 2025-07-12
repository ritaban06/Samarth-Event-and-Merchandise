import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',  // Modern blue
      dark: '#1E40AF',
      light: '#60A5FA',
    },
    secondary: {
      main: '#F59E0B',  // Modern amber
      dark: '#D97706',
      light: '#FCD34D',
    },
    background: {
      default: '#0F172A',  // Dark slate
      paper: '#1E293B',    // Slightly lighter slate
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.8)',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E293B',
          borderRight: '1px solid rgba(59, 130, 246, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(59, 130, 246, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(59, 130, 246, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3B82F6',
            },
          },
        },
      },
    },
  },
})

export default theme 