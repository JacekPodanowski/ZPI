// src/theme/ThemeProvider.jsx
// Provides application-wide access to the semantic theme system and bridges it with MUI.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';
import { ThemeProvider as MuiThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme as createSemanticTheme, assignCssVariables, generateColorScale } from './colorSystem';
import { themeDefinitions, defaultThemeId } from './themeDefinitions';
import { typography, textStyles, GOOGLE_FONTS_URL } from './typography';
import {
  defaultRoundness,
  defaultShadowPreset,
  defaultBorderWidthPreset,
  getRadiiTokens,
  getShadowTokens,
  getBorderWidthTokens
} from './shape';
import { spacingScale, defaultDensity } from './spacing';

const ThemeContext = createContext(null);

const STORAGE_KEYS = {
  theme: 'editorTheme',
  mode: 'editorMode',
  customThemes: 'customThemes'
};

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

const deepClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '')
  .replace(/-{2,}/g, '-');

const buildBaseConfig = (definition) => {
  const options = definition?.options || {};
  return {
    roundness: options.roundness || defaultRoundness,
    shadowPreset: options.shadowPreset || defaultShadowPreset,
    borderWidthPreset: options.borderWidthPreset || defaultBorderWidthPreset,
    density: typeof options.density === 'number' ? options.density : defaultDensity,
    fontScale: typeof options.fontScale === 'number' ? options.fontScale : 1,
    primaryColor: options.primaryColor || null,
    secondaryColor: options.secondaryColor || null
  };
};

const applyColorOverrides = (theme, config) => {
  const next = {
    ...theme,
    colors: {
      ...theme.colors,
      interactive: { ...theme.colors.interactive },
      calendar: { ...theme.colors.calendar },
      states: { ...theme.colors.states }
    }
  };

  if (config.primaryColor) {
    const primaryScale = generateColorScale(config.primaryColor);
    const isLight = theme.mode === 'light';
    next.primaryColor = config.primaryColor;
    next.colors.interactive.default = primaryScale[500];
    next.colors.interactive.hover = primaryScale[600];
    next.colors.interactive.active = primaryScale[700];
    next.colors.interactive.disabled = chroma(primaryScale[500]).alpha(isLight ? 0.4 : 0.5).hex();
    next.colors.interactive.subtle = chroma(primaryScale[500]).alpha(isLight ? 0.12 : 0.2).hex();
    next.colors.states.focus = chroma(primaryScale[500]).alpha(0.25).hex();
    next.colors.states.info = primaryScale[400];
    next.colors.states.critical = primaryScale[700];
    next.colors.calendar.event = chroma.mix(primaryScale[500], '#ffffff', 0.05, 'lab').hex();
  } else {
    next.primaryColor = null;
  }

  if (config.secondaryColor) {
    const secondaryScale = generateColorScale(config.secondaryColor);
    const isLight = theme.mode === 'light';
    next.secondaryColor = config.secondaryColor;
    next.colors.interactive.alternative = secondaryScale[500];
    next.colors.calendar.eventGroup = chroma.mix(secondaryScale[500], '#ffffff', 0.05, 'lab').hex();
    next.colors.calendar.availability = chroma(secondaryScale[400]).alpha(isLight ? 0.65 : 0.55).hex();
    next.colors.calendar.otherSiteEvent = chroma(secondaryScale[600]).alpha(0.35).hex();
  } else {
    next.secondaryColor = null;
  }

  return next;
};

const mergeWithBase = (baseTheme, config) => {
  const merged = deepClone(baseTheme);
  const roundness = config.roundness || defaultRoundness;
  const shadowPreset = config.shadowPreset || defaultShadowPreset;
  const borderPreset = config.borderWidthPreset || defaultBorderWidthPreset;

  merged.roundness = roundness;
  merged.shadowPreset = shadowPreset;
  merged.borderWidthPreset = borderPreset;
  merged.radii = getRadiiTokens(roundness);
  merged.shadows = getShadowTokens(shadowPreset);
  merged.borderWidths = getBorderWidthTokens(borderPreset);
  merged.density = typeof config.density === 'number' ? config.density : defaultDensity;
  merged.fontScale = typeof config.fontScale === 'number' ? config.fontScale : 1;
  merged.spacing = { ...spacingScale };

  return applyColorOverrides(merged, config);
};

export function ThemeProvider({ children, initialTheme = defaultThemeId, initialMode }) {
  const [customThemes, setCustomThemes] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.customThemes, null);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((theme) => ({ ...theme, isCustom: true }));
    } catch (error) {
      return [];
    }
  });

  const customThemeMap = useMemo(() => (
    customThemes.reduce((acc, theme) => {
      acc[theme.id] = theme;
      return acc;
    }, {})
  ), [customThemes]);

  const [currentThemeId, setCurrentThemeId] = useState(() => readStorage(STORAGE_KEYS.theme, initialTheme));
  const [mode, setMode] = useState(() => readStorage(STORAGE_KEYS.mode, initialMode || (prefersDarkMode() ? 'dark' : 'light')));

  const themeDefinition = useMemo(() => (
    customThemeMap[currentThemeId] || themeDefinitions[currentThemeId] || themeDefinitions[defaultThemeId]
  ), [currentThemeId, customThemeMap]);

  const defaultConfig = useMemo(() => buildBaseConfig(themeDefinition), [themeDefinition]);

  const [themeConfig, setThemeConfig] = useState(defaultConfig);

  useEffect(() => {
    setThemeConfig(defaultConfig);
  }, [defaultConfig, themeDefinition.id]);

  const semanticTheme = useMemo(
    () => ({
      ...createSemanticTheme(themeDefinition, mode),
      id: themeDefinition.id
    }),
    [themeDefinition, mode]
  );

  const workingTheme = useMemo(
    () => mergeWithBase(semanticTheme, themeConfig),
    [semanticTheme, themeConfig]
  );

  const muiTheme = useMemo(() => {
    const base = createMuiTheme({
      palette: {
        mode: workingTheme.mode,
        background: {
          default: workingTheme.colors.bg.page,
          paper: workingTheme.colors.bg.surface
        },
        text: {
          primary: workingTheme.colors.text.primary,
          secondary: workingTheme.colors.text.secondary,
          disabled: workingTheme.colors.text.disabled
        },
        primary: {
          main: workingTheme.colors.interactive.default,
          light: workingTheme.colors.interactive.hover,
          dark: workingTheme.colors.interactive.active,
          contrastText: workingTheme.colors.text.inverse
        },
        secondary: {
          main: workingTheme.colors.interactive.alternative,
          contrastText: workingTheme.colors.text.inverse
        },
        divider: workingTheme.colors.border.subtle,
        success: {
          main: workingTheme.colors.states.success
        },
        info: {
          main: workingTheme.colors.states.info
        },
        warning: {
          main: workingTheme.palettes.secondary[500]
        },
        error: {
          main: workingTheme.colors.states.critical
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
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              fontSize: `${16 * (workingTheme.fontScale || 1)}px`,
              transition: 'font-size 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            body: {
              backgroundColor: workingTheme.colors.bg.page,
              color: workingTheme.colors.text.primary,
              transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            a: {
              color: workingTheme.colors.text.link,
              transition: 'color 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '*': {
              transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), fill 0.35s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: workingTheme.radii?.soft || 16,
              fontWeight: typography.weights.semibold,
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }
        }
      }
    });

    base.typography.tokens = typography;
    base.typography.textStyles = textStyles;
    base.semantic = workingTheme;
    base.semanticColors = workingTheme.colors;
    return base;
  }, [workingTheme]);

  useEffect(() => {
    ensureFontsLoaded();
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.theme, themeDefinition.id);
  }, [themeDefinition.id]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.customThemes, JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    
    // Ensure smooth transition timing
    root.style.transition = 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    
    assignCssVariables(root, workingTheme);
    root.setAttribute('data-theme', workingTheme.mode);
    document.body.style.backgroundColor = workingTheme.colors.bg.page;
    document.body.style.color = workingTheme.colors.text.primary;
    document.body.style.transition = 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  }, [workingTheme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.fontSize = `${16 * (workingTheme.fontScale || 1)}px`;
  }, [workingTheme.fontScale]);

  const toggleMode = useCallback(() => {
    // Add a class to coordinate the transition
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.add('theme-transitioning');
      
      // Remove the class after transition completes
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 400);
    }
    
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const selectTheme = useCallback((themeId) => {
    if (themeId === themeDefinition.id) return;
    if (themeDefinitions[themeId] || customThemeMap[themeId]) {
      setCurrentThemeId(themeId);
    }
  }, [themeDefinition.id, customThemeMap]);

  const setNestedValue = (target, path, value) => {
    const segments = path.split('.');
    const next = { ...target };
    let cursor = next;
    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        cursor[segment] = value;
      } else {
        cursor[segment] = { ...(cursor[segment] || {}) };
        cursor = cursor[segment];
      }
    });
    return next;
  };

  const updateWorkingTheme = useCallback((path, value) => {
    setThemeConfig((prev) => {
      let next = { ...prev };
      switch (path) {
        case 'roundness':
          next.roundness = value;
          break;
        case 'shadows':
          next.shadowPreset = value;
          break;
        case 'borderWidths':
          next.borderWidthPreset = value;
          break;
        case 'density':
          next.density = typeof value === 'number' ? value : parseFloat(value);
          break;
        case 'fontScale':
          next.fontScale = typeof value === 'number' ? value : parseFloat(value);
          break;
        case 'primaryColor':
          next.primaryColor = value || null;
          break;
        case 'secondaryColor':
          next.secondaryColor = value || null;
          break;
        default:
          next = setNestedValue(next, path, value);
      }
      return next;
    });
  }, []);

  const saveCustomTheme = useCallback((name) => {
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      return { success: false, error: 'Wpisz nazwę motywu, aby go zapisać.' };
    }

    const baseSlug = slugify(trimmedName) || 'motyw';
    let candidateId = `custom-${baseSlug}`;
    if (themeDefinitions[candidateId] || customThemeMap[candidateId]) {
      candidateId = `custom-${baseSlug}-${Date.now()}`;
    }

    const newTheme = {
      id: candidateId,
      name: trimmedName,
      description: `${trimmedName} · Personalizowany motyw`,
      light: deepClone(themeDefinition.light),
      dark: deepClone(themeDefinition.dark),
      options: { ...themeConfig },
      isCustom: true
    };

    setCustomThemes((prev) => [...prev, newTheme]);
    setCurrentThemeId(candidateId);
    return { success: true, id: candidateId };
  }, [themeConfig, themeDefinition, customThemeMap]);

  const deleteCustomTheme = useCallback((themeId) => {
    setCustomThemes((prev) => prev.filter((theme) => theme.id !== themeId));
    if (currentThemeId === themeId) {
      setCurrentThemeId(defaultThemeId);
    }
  }, [currentThemeId]);

  const hasUnsavedChanges = useMemo(() => (
    JSON.stringify(themeConfig) !== JSON.stringify(defaultConfig)
  ), [themeConfig, defaultConfig]);

  const availableThemes = useMemo(() => (
    [
      ...Object.values(themeDefinitions).map((definition) => ({ ...definition, isCustom: false })),
      ...customThemes
    ]
  ), [customThemes]);

  const value = useMemo(
    () => ({
      theme: workingTheme,
      muiTheme,
      mode,
      themeId: themeDefinition.id,
      toggleMode,
      selectTheme,
      updateWorkingTheme,
      saveCustomTheme,
      deleteCustomTheme,
      availableThemes,
      customThemes,
      workingTheme,
      hasUnsavedChanges,
      themeConfig
    }),
    [workingTheme, muiTheme, mode, themeDefinition.id, toggleMode, selectTheme, updateWorkingTheme, saveCustomTheme, deleteCustomTheme, availableThemes, customThemes, hasUnsavedChanges, themeConfig]
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
