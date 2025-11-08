// Consolidated editor palette used across the Studio UI.
// Values are grouped by mode so components can stay in sync with the main theme colors.

const EDITOR_BASE_COLORS = {
  light: {
    background: 'rgb(228, 229, 218)',
    canvas: '#f6f6f1',
    surface: 'rgba(255, 255, 255, 0.82)',
    elevated: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.9)',
    hover: 'rgba(30, 30, 30, 0.06)',
    muted: 'rgba(30, 30, 30, 0.08)',
    border: 'rgba(30, 30, 30, 0.12)',
    borderStrong: 'rgba(30, 30, 30, 0.16)',
    textPrimary: 'rgb(30, 30, 30)',
    textMuted: 'rgba(30, 30, 30, 0.55)',
    textHint: 'rgba(30, 30, 30, 0.38)',
    textInverse: '#ffffff',
    accent: {
      main: 'rgb(146, 0, 32)',
      hover: 'rgb(114, 0, 21)',
      subtleLight: 'rgba(146, 0, 32, 0.12)',
      subtleDark: 'rgba(146, 0, 32, 0.22)',
      focusLight: 'rgba(146, 0, 32, 0.25)',
      focusDark: 'rgba(146, 0, 32, 0.35)',
      criticalLight: 'rgb(180, 40, 50)',
      criticalDark: 'rgb(210, 70, 70)'
    },
    focus: 'rgba(30, 30, 30, 0.2)',
    interactiveSubtle: 'rgba(30, 30, 30, 0.08)',
    interactiveCritical: 'rgba(60, 60, 60, 1)',
    trash: {
      idle: 'rgba(146, 0, 32, 0.58)',
      hover: 'rgba(146, 0, 32, 0.72)',
      iconIdle: 'rgba(255, 255, 255, 0.72)',
      iconActive: 'rgba(255, 255, 255, 0.92)',
      labelIdle: 'rgba(255, 255, 255, 0.78)',
      labelActive: 'rgba(255, 255, 255, 0.92)',
      outline: 'rgba(255, 255, 255, 0.25)'
    },
    controlGroup: {
      bg: 'rgba(30, 30, 30, 0.04)',
      hover: 'rgba(30, 30, 30, 0.08)',
      iconInactive: 'rgba(30, 30, 30, 0.45)',
      iconActive: 'rgba(30, 30, 30, 0.9)'
    },
    shadow: {
      deep: '0 18px 32px rgba(15, 23, 42, 0.12)'
    },
    moduleToolbar: {
      hover: 'rgba(30, 30, 30, 0.04)',
      header: 'rgba(0, 0, 0, 0.02)',
      surface: '#ffffff',
      border: 'rgba(30, 30, 30, 0.08)'
    }
  },
  dark: {
    background: 'rgb(12, 12, 12)',
    canvas: 'rgb(24, 24, 24)',
    surface: 'rgba(24, 24, 26, 0.92)',
    elevated: 'rgb(36, 36, 36)',
    overlay: 'rgba(12, 12, 12, 0.82)',
    hover: 'rgba(255, 255, 255, 0.08)',
    muted: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(220, 220, 220, 0.16)',
    borderStrong: 'rgba(220, 220, 220, 0.28)',
    textPrimary: 'rgba(230, 230, 230, 0.92)',
    textMuted: 'rgba(210, 210, 210, 0.6)',
    textHint: 'rgba(200, 200, 200, 0.42)',
    textInverse: 'rgba(15, 15, 15, 0.92)',
    accent: {
      main: 'rgb(114, 0, 21)',
      hover: 'rgb(146, 0, 32)',
      subtleLight: 'rgba(114, 0, 21, 0.18)',
      subtleDark: 'rgba(146, 0, 32, 0.28)',
      focusLight: 'rgba(255, 255, 255, 0.16)',
      focusDark: 'rgba(255, 255, 255, 0.24)',
      criticalLight: 'rgba(235, 120, 120, 0.42)',
      criticalDark: 'rgba(255, 140, 140, 0.5)'
    },
    focus: 'rgba(255, 255, 255, 0.24)',
    interactiveSubtle: 'rgba(255, 255, 255, 0.12)',
    interactiveCritical: 'rgba(255, 255, 255, 0.4)',
    trash: {
      idle: 'rgba(114, 0, 21, 0.62)',
      hover: 'rgba(146, 0, 32, 0.78)',
      iconIdle: 'rgba(255, 255, 255, 0.82)',
      iconActive: 'rgba(255, 255, 255, 0.95)',
      labelIdle: 'rgba(255, 255, 255, 0.85)',
      labelActive: 'rgba(255, 255, 255, 0.97)',
      outline: 'rgba(255, 255, 255, 0.28)'
    },
    controlGroup: {
      bg: 'rgba(255, 255, 255, 0.08)',
      hover: 'rgba(255, 255, 255, 0.16)',
      iconInactive: 'rgba(200, 200, 200, 0.5)',
      iconActive: 'rgba(255, 255, 255, 0.92)'
    },
    shadow: {
      deep: '0 24px 60px rgba(0, 0, 0, 0.55)'
    },
    moduleToolbar: {
      hover: 'rgba(255, 255, 255, 0.08)',
      header: 'rgba(255, 255, 255, 0.05)',
      surface: '#1f2024',
      border: 'rgba(255, 255, 255, 0.14)'
    }
  }
};

const parseRgb = (input) => {
  if (!input) return null;
  if (input.startsWith('#')) {
    const hex = input.replace('#', '');
    const normalized = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex;
    if (normalized.length !== 6) return null;
    const value = parseInt(normalized, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }
  if (input.startsWith('rgb')) {
    const match = input.match(/\d+/g);
    if (!match || match.length < 3) return null;
    return {
      r: Number(match[0]),
      g: Number(match[1]),
      b: Number(match[2])
    };
  }
  return null;
};

const withAlpha = (color, alpha) => {
  const rgb = parseRgb(color);
  if (!rgb) return null;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

export const resolveEditorPalette = (theme = {}) => {
  const mode = theme?.mode === 'dark' ? 'dark' : 'light';
  const base = EDITOR_BASE_COLORS[mode];
  const semanticColors = theme?.colors || {};
  const bg = semanticColors.bg || {};
  const text = semanticColors.text || {};
  const border = semanticColors.border || {};
  const interactive = semanticColors.interactive || {};
  const states = semanticColors.states || {};

  const background = bg.page || base.background;
  const surface = bg.surface || base.surface;
  const elevated = bg.elevated || base.elevated;
  const overlay = withAlpha(bg.surface || base.surface, mode === 'dark' ? 0.85 : 0.92) || base.overlay;
  const hover = base.hover;
  const muted = base.muted;

  return {
    mode,
    background,
    canvas: bg.surface || base.canvas,
    surface,
    elevated,
    overlay,
    hover,
    muted,
    border: border.subtle || base.border,
    borderStrong: border.strong || base.borderStrong,
    textPrimary: text.primary || base.textPrimary,
    textMuted: text.secondary || base.textMuted,
    textHint: text.hint || base.textHint,
    textInverse: text.inverse || base.textInverse,
    accent: interactive.default || base.accent.main,
    accentHover: interactive.hover || base.accent.hover,
    focus: states.focus || base.focus,
    interactiveSubtle: interactive.subtle || base.interactiveSubtle,
    interactiveCritical: states.critical || base.interactiveCritical,
    trash: base.trash,
    controlGroup: base.controlGroup,
    shadow: base.shadow,
    moduleToolbar: base.moduleToolbar
  };
};

// Legacy export kept for backwards compatibility while the palette migrates.
const LEGACY_EDITOR_COLORS = {
  accent: EDITOR_BASE_COLORS.light.accent,
  moduleToolbar: EDITOR_BASE_COLORS.light.moduleToolbar,
  base: EDITOR_BASE_COLORS
};

export { EDITOR_BASE_COLORS };
export default LEGACY_EDITOR_COLORS;
