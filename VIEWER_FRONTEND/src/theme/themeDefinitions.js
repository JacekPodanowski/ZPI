// src/theme/themeDefinitions.js
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

export const themeDefinitions = {
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
  sereneForest: {
    id: 'sereneForest',
    name: 'Serene Forest',
    description: 'Miękkie, leśne zielenie z ciepłymi tonami ziemi.',
    light: {
      background: '#edf2e6',
      text: '#1a261d',
      primary: '#3a7d44',
      secondary: '#d6c7a1'
    },
    dark: {
      background: '#101712',
      text: '#dfe8d9',
      primary: '#2f6a37',
      secondary: '#5a4f34'
    },
    options: createBaseOptions()
  },
  oceanCalm: {
    id: 'oceanCalm',
    name: 'Ocean Calm',
    description: 'Mglisty błękit i chłodne slate’y inspirowane morską bryzą.',
    light: {
      background: '#e6eef5',
      text: '#1a2330',
      primary: '#1f6fb2',
      secondary: '#a7b7c8'
    },
    dark: {
      background: '#0d141d',
      text: '#d6e0eb',
      primary: '#1b5c91',
      secondary: '#3e5062'
    },
    options: createBaseOptions()
  },
  sunsetWarmth: {
    id: 'sunsetWarmth',
    name: 'Sunset Warmth',
    description: 'Terracotta, bursztyn i złote światło zachodzącego słońca.',
    light: {
      background: '#f6eee6',
      text: '#2a1a14',
      primary: '#c1522c',
      secondary: '#f0c27b'
    },
    dark: {
      background: '#1a1210',
      text: '#f2e2d7',
      primary: '#a74324',
      secondary: '#704a24'
    },
    options: createBaseOptions()
  },
  lavenderDream: {
    id: 'lavenderDream',
    name: 'Lavender Dream',
    description: 'Delikatne fiolety i srebrno-różowe półtony.',
    light: {
      background: '#f2eef9',
      text: '#211c2c',
      primary: '#7a5cc2',
      secondary: '#d9c7eb'
    },
    dark: {
      background: '#161222',
      text: '#e6ddf8',
      primary: '#6a4fb4',
      secondary: '#5a4a75'
    },
    options: createBaseOptions()
  }
};

export const defaultThemeId = 'modernWellness';
