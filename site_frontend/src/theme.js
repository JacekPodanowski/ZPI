// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Uruchom tryb ciemny MUI
    primary: {
      main: '#ff8c00', // Twój pomarańczowy
      contrastText: '#000000', // Tekst na przycisku primary
    },
    secondary: {
      main: '#9932cc', // Twój fioletowy
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212', // Główne tło aplikacji
      paper: '#1e1e1e',   // Tło dla "papierowych" elementów jak karty, modale
    },
    text: {
      primary: '#e0e0e0',   // Główny kolor tekstu
      secondary: '#b0b0b0', // Drugorzędny kolor tekstu
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ffa726',
    },
    info: {
      main: '#29b6f6',
    },
    success: {
      main: '#66bb6a',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"',
      'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"',
    ].join(','),
    h1: { fontWeight: 700, fontSize: '2.8rem' },
    h2: { fontWeight: 600, fontSize: '2.2rem' },
    h3: { fontWeight: 600, fontSize: '1.8rem' },
    button: {
      textTransform: 'none', // Wyłącz domyślne wielkie litery w przyciskach MUI
      fontWeight: 600,
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Ciemne tło dla AppBar
          boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Bardziej zaokrąglone przyciski
          paddingTop: '10px',
          paddingBottom: '10px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#e67e00', // Ciemniejszy pomarańczowy on hover
          },
        },
        containedSecondary: {
            '&:hover': {
              backgroundColor: '#8728b3',
            },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)', // Subtelny cień
        }
      }
    },
    MuiTextField: { // Style dla inputów MUI, jeśli będziesz ich używać
        styleOverrides: {
            root: {
                '& label.Mui-focused': {
                    color: '#ff8c00', // Kolor etykiety przy focusie
                },
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#444444', // Kolor ramki
                    },
                    '&:hover fieldset': {
                        borderColor: '#666666',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#ff8c00', // Kolor ramki przy focusie
                    },
                },
            },
        },
    },
  },
});

export default theme;