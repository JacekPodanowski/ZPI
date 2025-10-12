// src/theme/ThemeProvider.jsx
// Provides application-wide access to the semantic theme system and bridges it with MUI.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as MuiThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme as createSemanticTheme, assignCssVariables } from './colorSystem';
import { themeDefinitions, defaultThemeId } from './themeDefinitions';
import { typography, textStyles, GOOGLE_FONTS_URL } from './typography';

const ThemeContext = createContext(null);

const prefersDarkMode = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // storage may be unavailable (private mode) – fail silently
  }
};

const ensureFontsLoaded = () => {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('app-google-fonts');
  if (existing) {
    if (existing.getAttribute('href') !== GOOGLE_FONTS_URL) {
      existing.setAttribute('href', GOOGLE_FONTS_URL);
    }
    return;
  }

  const link = document.createElement('link');
  link.id = 'app-google-fonts';
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONTS_URL;
  document.head.appendChild(link);
};

export function ThemeProvider({ children, initialTheme = defaultThemeId, initialMode }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => readStorage('editorTheme', initialTheme));
  const [mode, setMode] = useState(() => readStorage('editorMode', initialMode || (prefersDarkMode() ? 'dark' : 'light')));

  const themeDefinition = themeDefinitions[currentThemeId] || themeDefinitions[defaultThemeId];

  const semanticTheme = useMemo(
    () => ({
      ...createSemanticTheme(themeDefinition, mode),
      id: themeDefinition.id
    }),
    [themeDefinition, mode]
  );

  const muiTheme = useMemo(() => {
    const base = createMuiTheme({
      palette: {
        mode: semanticTheme.mode,
        background: {
          default: semanticTheme.colors.bg.page,
          paper: semanticTheme.colors.bg.surface
        },
        text: {
          primary: semanticTheme.colors.text.primary,
          secondary: semanticTheme.colors.text.secondary,
          disabled: semanticTheme.colors.text.disabled
        },
        primary: {
          main: semanticTheme.colors.interactive.default,
          light: semanticTheme.colors.interactive.hover,
          dark: semanticTheme.colors.interactive.active,
          contrastText: semanticTheme.colors.text.inverse
        },
        secondary: {
          main: semanticTheme.colors.interactive.alternative,
          contrastText: semanticTheme.colors.text.inverse
        },
        divider: semanticTheme.colors.border.subtle,
        success: {
          main: semanticTheme.colors.states.success
        },
        info: {
          main: semanticTheme.colors.states.info
        },
        warning: {
          main: semanticTheme.palettes.secondary[500]
        },
        error: {
          main: semanticTheme.colors.states.critical
        }
      },
      typography: {
        fontFamily: typography.fonts.body,
        h1: { ...textStyles.h1 },
        h2: { ...textStyles.h2 },
        h3: { ...textStyles.h3 },
        h4: { ...textStyles.h4 },
        h5: { ...textStyles.h5 },
        h6: { ...textStyles.h6 },
        subtitle1: { ...textStyles.bodyLarge },
        subtitle2: { ...textStyles.body },
        body1: { ...textStyles.body },
        body2: { ...textStyles.bodySmall },
        button: { ...textStyles.button },
        caption: { ...textStyles.caption },
        overline: { ...textStyles.label, textTransform: 'uppercase', letterSpacing: '0.12em' }
      },
      shape: {
        borderRadius: 16
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: semanticTheme.colors.bg.page,
              color: semanticTheme.colors.text.primary
            },
            a: {
              color: semanticTheme.colors.text.link
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 999,
              fontWeight: typography.weights.semibold
            }
          }
        }
      }
    });

    base.typography.tokens = typography;
    base.typography.textStyles = textStyles;
    base.semantic = semanticTheme;
    base.semanticColors = semanticTheme.colors;
    return base;
  }, [semanticTheme]);

  useEffect(() => {
    ensureFontsLoaded();
  }, []);

  useEffect(() => {
    writeStorage('editorTheme', currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    writeStorage('editorMode', mode);
  }, [mode]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    assignCssVariables(root, semanticTheme);
    root.setAttribute('data-theme', semanticTheme.mode);
    document.body.style.backgroundColor = semanticTheme.colors.bg.page;
    document.body.style.color = semanticTheme.colors.text.primary;
  }, [semanticTheme]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const switchTheme = (themeId) => {
    if (themeDefinitions[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  const value = useMemo(
    () => ({
      theme: semanticTheme,
      muiTheme,
      mode,
      themeId: currentThemeId,
      toggleMode,
      switchTheme,
      availableThemes: Object.values(themeDefinitions).map(({ id, name, description }) => ({ id, name, description }))
    }),
    [semanticTheme, muiTheme, mode, currentThemeId]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialTheme: PropTypes.string,
  initialMode: PropTypes.oneOf(['light', 'dark'])
};

ThemeProvider.defaultProps = {
  initialTheme: defaultThemeId,
  initialMode: undefined
};

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeContext;
