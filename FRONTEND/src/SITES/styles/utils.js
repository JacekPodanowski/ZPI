import { createTheme } from '../../theme/colorSystem';
import { STYLES, DEFAULT_STYLE_ID } from './index';

const STYLE_ALIAS_MAP = {
  vibe1: 'auroraMinimal',
  auroraminimal: 'auroraMinimal',
  modernwellness: 'auroraMinimal',
  vibe2: 'nocturneBold',
  nocturnebold: 'nocturneBold',
  goldenhour: 'nocturneBold',
  vibe3: 'solsticePastel',
  solsticepastel: 'solsticePastel',
  lavenderdream: 'solsticePastel',
  vibe4: 'verdantOrganic',
  verdantorganic: 'verdantOrganic',
  sereneforest: 'verdantOrganic',
  vibe5: 'lumenEditorial',
  lumeneditorial: 'lumenEditorial',
  slate: 'lumenEditorial'
};

export const sanitizeStyleOverrides = (overrides = {}) => {
  if (!overrides || typeof overrides !== 'object') {
    return {};
  }

  const clone = { ...overrides };
  delete clone.id;
  delete clone.mode;
  delete clone.styleId;
  delete clone.defaultStyleId;
  delete clone.themeId;
  delete clone.vibe;
  delete clone.vibeId;
  return clone;
};

export const deepMerge = (target, source) => {
  if (!source || typeof source !== 'object') {
    return target;
  }

  const output = Array.isArray(target) ? [...target] : { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (Array.isArray(sourceValue)) {
      output[key] = sourceValue.slice();
      return;
    }

    if (sourceValue && typeof sourceValue === 'object') {
      output[key] = deepMerge(
        targetValue && typeof targetValue === 'object' ? targetValue : {},
        sourceValue
      );
      return;
    }

    output[key] = sourceValue;
  });

  return output;
};

export const composeSiteStyle = (styleId, overrides = {}) => {
  const definition = STYLES[styleId] || STYLES[DEFAULT_STYLE_ID];
  const semantic = createTheme(definition, 'light');

  const colorSnapshot = {
    background: semantic.colors.bg.page,
    page: semantic.colors.bg.page,
    surface: semantic.colors.bg.surface,
    elevated: semantic.colors.bg.elevated,
    subtle: semantic.colors.bg.subtle,
    hover: semantic.colors.bg.hover,
    text: semantic.colors.text.primary,
    neutral: semantic.colors.text.secondary,
    primary: semantic.colors.interactive.default,
    secondary: semantic.colors.interactive.alternative,
    accent: semantic.colors.interactive.default,
    border: semantic.colors.border.default,
    borderStrong: semantic.colors.border.strong,
    borderSubtle: semantic.colors.border.subtle,
    grey: semantic.colors.text.secondary
  };

  const baseStyle = {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    mode: 'light',
    options: definition.options,
    previewImage: definition.previewImage || null,
    backgroundColor: definition.backgroundColor,
    backgroundTexture: definition.backgroundTexture || null,
    overlayGradient: definition.overlayGradient || null,
    accentColor: definition.accentColor,
    titleFont: definition.titleFont,
    textFont: definition.textFont || definition.titleFont,
    spacing: definition.spacing,
    borders: definition.borders,
    shadows: definition.shadows,
    rounded: definition.rounded,
    animations: definition.animations,
    textSize: definition.textSize,
    headingSize: definition.headingSize,
    buttonStyle: definition.buttonStyle,
    cardStyle: definition.cardStyle,
    palette: definition.light,
    colors: colorSnapshot,
    background: colorSnapshot.background,
    surface: colorSnapshot.surface,
    text: colorSnapshot.text,
    primary: colorSnapshot.primary,
    secondary: colorSnapshot.secondary,
    neutral: colorSnapshot.neutral,
    accent: colorSnapshot.accent,
    borderColor: colorSnapshot.border,
    grey: colorSnapshot.grey
  };

  const cleanOverrides = sanitizeStyleOverrides(overrides);

  if (cleanOverrides.colors) {
    const mergedColors = deepMerge(colorSnapshot, cleanOverrides.colors);
    cleanOverrides.colors = mergedColors;
    cleanOverrides.background = mergedColors.background || baseStyle.background;
    cleanOverrides.surface = mergedColors.surface || baseStyle.surface;
    cleanOverrides.text = mergedColors.text || baseStyle.text;
    cleanOverrides.primary = mergedColors.primary || baseStyle.primary;
    cleanOverrides.secondary = mergedColors.secondary || baseStyle.secondary;
    cleanOverrides.neutral = mergedColors.neutral || baseStyle.neutral;
    cleanOverrides.accent = mergedColors.accent || baseStyle.accent;
    cleanOverrides.borderColor = mergedColors.border || baseStyle.borderColor;
    cleanOverrides.grey = mergedColors.grey || baseStyle.grey;
  }

  return deepMerge(baseStyle, cleanOverrides);
};

const extractNestedStyleOverrides = (style = {}) => {
  if (!style || typeof style !== 'object') {
    return {};
  }

  const { id, styleId, vibe, vibeId, themeId, theme, ...rest } = style;
  const overrides = { ...rest };

  if (theme && typeof theme === 'object' && !Array.isArray(theme)) {
    overrides.colors = deepMerge(overrides.colors || {}, theme);
  }

  if (Array.isArray(style)) {
    return {};
  }

  return overrides;
};

export const extractStyleOverrides = (input = {}) => {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const overrides = {};

  if (input.styleOverrides && typeof input.styleOverrides === 'object') {
    Object.assign(overrides, input.styleOverrides);
  }

  if (input.style && typeof input.style === 'object' && !Array.isArray(input.style)) {
    Object.assign(overrides, extractNestedStyleOverrides(input.style));
  }

  const legacyTheme = input.themeOverrides || input.theme;
  if (legacyTheme && typeof legacyTheme === 'object' && !Array.isArray(legacyTheme)) {
    overrides.colors = deepMerge(overrides.colors || {}, legacyTheme);
  }

  return sanitizeStyleOverrides(overrides);
};

const coerceStyleId = (candidate) => {
  if (!candidate || typeof candidate !== 'string') {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  if (STYLES[trimmed]) {
    return trimmed;
  }

  const aliasKey = trimmed.toLowerCase();
  const alias = STYLE_ALIAS_MAP[aliasKey];
  if (alias && STYLES[alias]) {
    return alias;
  }

  return null;
};

export const resolveStyleId = (input = {}) => {
  if (typeof input === 'string') {
    return coerceStyleId(input) || DEFAULT_STYLE_ID;
  }

  const candidates = [
    input.styleId,
    input.style?.id,
    input.style?.styleId,
    typeof input.style === 'string' ? input.style : null,
    input.vibe,
    input.vibeId,
    input.style?.vibe,
    input.themeId,
    input.theme?.id
  ];

  for (const value of candidates) {
    const resolved = coerceStyleId(value);
    if (resolved) {
      return resolved;
    }
  }

  return DEFAULT_STYLE_ID;
};

export const normalizeStyleState = (input = {}) => {
  const styleId = resolveStyleId(input);
  const overrides = extractStyleOverrides(input);
  const style = composeSiteStyle(styleId, overrides);
  return {
    styleId,
    styleOverrides: overrides,
    style
  };
};

export default composeSiteStyle;
