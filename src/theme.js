import { createTheme } from '@mui/material/styles'

// 苹果风格的 Material-UI 主题
export const appleTheme = createTheme({
  palette: {
    primary: {
      main: '#007aff',
      light: '#5ac8fa',
      dark: '#0066d6',
    },
    secondary: {
      main: '#5856d6',
    },
    grey: {
      50: '#f5f5f7',
      100: '#e8e8ed',
      200: '#d1d1d6',
      300: '#c7c7cc',
      400: '#aeaeb2',
      500: '#86868b',
      600: '#636366',
      700: '#48484a',
      800: '#3a3a3c',
      900: '#1d1d1f',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans SC',
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'SF Pro Text',
      'PingFang SC',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '15px',
      lineHeight: 1.6,
      letterSpacing: '-0.01em',
    },
    body2: {
      fontSize: '13px',
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.04)',
    '0 4px 12px rgba(0,0,0,0.06)',
    '0 6px 16px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.08)',
    '0 12px 32px rgba(0,0,0,0.10)',
    '0 16px 48px rgba(0,0,0,0.12)',
    '0 20px 56px rgba(0,0,0,0.14)',
    '0 24px 64px rgba(0,0,0,0.16)',
    // ... 其他阴影级别
    ...Array(15).fill('0 24px 64px rgba(0,0,0,0.16)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:active': {
            transform: 'scale(0.96)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
        elevation3: {
          boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 500,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:active': {
            transform: 'scale(0.92)',
          },
        },
      },
    },
  },
})

// 暗黑模式主题
export const appleDarkTheme = createTheme({
  ...appleTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0a84ff',
      light: '#64d2ff',
      dark: '#0066d6',
    },
    secondary: {
      main: '#5e5ce6',
    },
    grey: {
      50: '#1d1d1f',
      100: '#2c2c2e',
      200: '#3a3a3c',
      300: '#48484a',
      400: '#636366',
      500: '#86868b',
      600: '#98989d',
      700: '#aeaeb2',
      800: '#c7c7cc',
      900: '#e5e5ea',
    },
    background: {
      default: '#1c1c1e',
      paper: '#2c2c2e',
    },
    text: {
      primary: '#f5f5f7',
      secondary: '#98989d',
    },
  },
})
