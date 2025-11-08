import { resolveEditorPalette } from './EditorColors';

const buildTokens = (theme = {}) => {
  const palette = resolveEditorPalette(theme);

  return {
    mode: palette.mode,
    backgrounds: {
      page: palette.background,
      canvas: palette.canvas
    },
    surfaces: {
      overlay: palette.overlay,
      base: palette.surface,
      elevated: palette.elevated,
      hover: palette.hover,
      muted: palette.muted
    },
    borders: {
      subtle: palette.border,
      strong: palette.borderStrong
    },
    text: {
      primary: palette.textPrimary,
      muted: palette.textMuted,
      hint: palette.textHint,
      inverse: palette.textInverse
    },
    interactive: {
      main: palette.accent,
      hover: palette.accentHover,
      subtle: palette.interactiveSubtle,
      focus: palette.focus,
      critical: palette.interactiveCritical
    },
    trashZone: { ...palette.trash },
    shadows: {
      deep: palette.shadow.deep
    },
    controls: {
      groupBg: palette.controlGroup.bg,
      groupHoverBg: palette.controlGroup.hover,
      iconInactive: palette.controlGroup.iconInactive,
      iconActive: palette.controlGroup.iconActive
    },
    moduleToolbar: { ...palette.moduleToolbar }
  };
};

export const getEditorColorTokens = (theme = {}) => {
  const tokens = buildTokens(theme);
  return {
    ...tokens,
    backgrounds: { ...tokens.backgrounds },
    surfaces: { ...tokens.surfaces },
    borders: { ...tokens.borders },
    text: { ...tokens.text },
    interactive: { ...tokens.interactive },
    trashZone: { ...tokens.trashZone },
    shadows: { ...tokens.shadows },
    controls: { ...tokens.controls },
    moduleToolbar: { ...tokens.moduleToolbar }
  };
};

export default getEditorColorTokens;
