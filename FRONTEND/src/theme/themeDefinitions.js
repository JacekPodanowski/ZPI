// src/theme/themeDefinitions.js
// ============================================================================
// STUDIO THEMES - for the Studio/Editor UI interface only
// ============================================================================
// These themes control the appearance of the Studio application (editor, dashboard, etc.).
// Note: User sites have their own separate styles system (SITES/styles).
// Defines base colors for each theme in light and dark modes.
// Users select only these base colors; the rest of the palette is generated automatically.

const createBaseOptions = () => ({
  roundness: 'soft',
  shadowPreset: 'floating',
  borderWidthPreset: 'hairline',
  density: 1,
  fontScale: 1,
  primaryColor: null,
  secondaryColor: null
});

// Studio theme definitions
export const STUDIO_THEMES = {
  modernWellness: {
    id: 'modernWellness',
    name: 'Modern Wellness',
    description: 'Ciepły beż, głęboka czerwień akcentowa i spokojne neutrals.',
    light: {
      background: '#e4e5da',
      text: '#1e1e1e',
      primary: '#920020',
      secondary: '#bcbab3'
    },
    dark: {
      background: '#0c0c0c',
      text: '#dcdcdc',
      primary: '#720015',
      secondary: '#464644'
    },
    options: createBaseOptions()
  },
  warmSand: {
    id: 'warmSand',
    name: 'Warm Sand',
    description: 'Ciepłe piaskowe beże z naturalnymi brązowymi akcentami.',
    light: {
      background: '#faf8f5',
      text: '#2a251f',
      primary: '#a67c52',
      secondary: '#e8ddd0'
    },
    dark: {
      background: '#1a1612',
      text: '#f2ebe2',
      primary: '#8f6b47',
      secondary: '#4a3f35'
    },
    options: createBaseOptions()
  },
  sageStudio: {
    id: 'sageStudio',
    name: 'Sage Studio',
    description: 'Stonowane zielenie z ciepłymi neutralami dla spokojnej przestrzeni.',
    light: {
      background: '#e9ede8',
      text: '#1f241e',
      primary: '#4a7456',
      secondary: '#c4cdc0'
    },
    dark: {
      background: '#111512',
      text: '#dfe5dd',
      primary: '#3c5e47',
      secondary: '#3f4a3e'
    },
    options: createBaseOptions()
  },
  neonDusk: {
    id: 'neonDusk',
    name: 'Neon Dusk',
    description: 'Intensywna pomarańcz i głęboki fiolet - nowoczesna energia.',
    light: {
      background: '#faf7f5',
      text: '#1a1214',
      primary: '#e8530f',
      secondary: '#d4c5e0'
    },
    dark: {
      background: '#0d0a0e',
      text: '#f5ede8',
      primary: '#ff6b2b',
      secondary: '#6b4c7a'
    },
    options: createBaseOptions()
  },
  magentaDreams: {
    id: 'magentaDreams',
    name: 'Magenta Dreams',
    description: 'Głęboka magenta i różowe odcienie inspirowane zachodem słońca.',
    light: {
      background: '#fdf9fb',
      text: '#1e1420',
      primary: '#d91e7a',
      secondary: '#e8d4e8'
    },
    dark: {
      background: '#0e0a12',
      text: '#f5e8f2',
      primary: '#ff4d9d',
      secondary: '#4a2f5e'
    },
    options: createBaseOptions()
  },
  pureMinimal: {
    id: 'pureMinimal',
    name: 'Pure Minimal',
    description: 'Absolutny minimalizm - czysta czerń i biel.',
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#1a1a1a',
      secondary: '#e8e8e8'
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      primary: '#cccccc',
      secondary: '#1a1a1a'
    },
    options: createBaseOptions()
  }
};

// Backward compatibility export
export const themeDefinitions = STUDIO_THEMES;

export const defaultThemeId = 'modernWellness';