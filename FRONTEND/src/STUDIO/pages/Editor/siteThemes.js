const LIGHT_THEMES = {
  background: 'rgb(228, 229, 218)',
  text: 'rgb(30, 30, 30)',
  primary: 'rgb(146, 0, 32)',
  secondary: 'rgb(188, 186, 179)',
  grey: 'rgb(188, 186, 179)',
  page: 'rgb(228, 229, 218)',
  surface: 'rgba(255, 255, 255, 0.98)',
  elevated: '#ffffff',
  border: 'rgba(30, 30, 30, 0.12)',
  divider: 'rgba(30, 30, 30, 0.08)',
  hover: 'rgba(146, 0, 32, 0.08)',
  focus: 'rgba(146, 0, 32, 0.12)',
  disabled: 'rgba(30, 30, 30, 0.38)',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32'
};

const DARK_THEMES = {
  background: 'rgb(12, 12, 12)',
  text: 'rgb(220, 220, 220)',
  primary: 'rgb(114, 0, 21)',
  secondary: 'rgb(70, 70, 68)',
  grey: 'rgb(70, 70, 68)',
  page: 'rgb(12, 12, 12)',
  surface: 'rgb(24, 24, 24)',
  elevated: 'rgb(36, 36, 36)',
  border: 'rgba(220, 220, 220, 0.16)',
  divider: 'rgba(220, 220, 220, 0.12)',
  hover: 'rgba(114, 0, 21, 0.35)',
  focus: 'rgba(114, 0, 21, 0.45)',
  disabled: 'rgba(220, 220, 220, 0.38)',
  error: '#ef9a9a',
  warning: '#ffb74d',
  info: '#4fc3f7',
  success: '#81c784'
};

const BASE_THEMES = {
  light: LIGHT_THEMES,
  dark: DARK_THEMES
};

const applyOverrides = (baseTheme, overrides) => {
  if (!overrides) {
    return { ...baseTheme };
  }

  const next = { ...baseTheme };

  if (overrides.primary) {
    next.primary = overrides.primary;
  }

  if (overrides.secondary) {
    next.secondary = overrides.secondary;
    next.grey = overrides.secondary;
  }

  if (overrides.neutral) {
    next.surface = overrides.neutral;
    next.page = overrides.neutral;
    next.background = overrides.neutral;
  }

  return next;
};

export const getPreviewTheme = (mode = 'light', overrides) => {
  const safeMode = mode === 'dark' ? 'dark' : 'light';
  const base = BASE_THEMES[safeMode];
  return applyOverrides(base, overrides);
};
