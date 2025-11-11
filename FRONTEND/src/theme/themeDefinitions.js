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
  },
  mintBreeze: {
    id: 'mintBreeze',
    name: 'Mint Breeze',
    description: 'Refreshing mint greens with cool grays and soft ivory.',
    light: {
      background: '#f0f7f4',
      text: '#1a2e25',
      primary: '#4a9b7f',
      secondary: '#c8ddd4'
    },
    dark: {
      background: '#0e1814',
      text: '#e2f0ea',
      primary: '#3d8168',
      secondary: '#4a5b52'
    },
    options: createBaseOptions()
  },
  coralSunset: {
    id: 'coralSunset',
    name: 'Coral Sunset',
    description: 'Soft coral and peach tones with warm sandy neutrals.',
    light: {
      background: '#fef5f1',
      text: '#2d1f1a',
      primary: '#e57373',
      secondary: '#f4d9c6'
    },
    dark: {
      background: '#1d1311',
      text: '#f7ebe3',
      primary: '#c85f5f',
      secondary: '#6b4a3d'
    },
    options: createBaseOptions()
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    description: 'Professional grays with deep blue-gray accents and crisp whites.',
    light: {
      background: '#f8fafc',
      text: '#1e293b',
      primary: '#475569',
      secondary: '#cbd5e1'
    },
    dark: {
      background: '#0f172a',
      text: '#e2e8f0',
      primary: '#64748b',
      secondary: '#334155'
    },
    options: createBaseOptions()
  },
  goldenHour: {
    id: 'goldenHour',
    name: 'Golden Hour',
    description: 'Warm honey golds with rich amber and soft cream.',
    light: {
      background: '#fef9f1',
      text: '#2c2416',
      primary: '#d4a756',
      secondary: '#f0ddb8'
    },
    dark: {
      background: '#1a1510',
      text: '#f5ead5',
      primary: '#b88f47',
      secondary: '#6b5638'
    },
    options: createBaseOptions()
  },
  roseGarden: {
    id: 'roseGarden',
    name: 'Rose Garden',
    description: 'Dusty rose with muted mauve and soft blush tones.',
    light: {
      background: '#fdf5f7',
      text: '#2e1c22',
      primary: '#b87b8a',
      secondary: '#e8d4d9'
    },
    dark: {
      background: '#1b1214',
      text: '#f3e3e8',
      primary: '#9f6775',
      secondary: '#5d434a'
    },
    options: createBaseOptions()
  }
};

// Backward compatibility export
export const themeDefinitions = STUDIO_THEMES;

export const defaultThemeId = 'modernWellness';
