const BASE_THEME = {
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

const applyOverrides = (baseTheme, overrides) => {
  if (!overrides) {
    return { ...baseTheme };
  }

  const next = { ...baseTheme };

  const directKeys = [
    'background',
    'text',
    'primary',
    'secondary',
    'grey',
    'page',
    'surface',
    'elevated',
    'border',
    'divider',
    'hover',
    'focus',
    'disabled',
    'error',
    'warning',
    'info',
    'success'
  ];

  directKeys.forEach((key) => {
    if (overrides[key]) {
      next[key] = overrides[key];
    }
  });

  if (overrides.secondary) {
    next.grey = overrides.secondary;
  }

  if (overrides.neutral) {
    next.surface = overrides.neutral;
    next.page = overrides.neutral;
    next.background = overrides.neutral;
  }

  return next;
};

export const getPreviewTheme = (overrides) => applyOverrides(BASE_THEME, overrides);
