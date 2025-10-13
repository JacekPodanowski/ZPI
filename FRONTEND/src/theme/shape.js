// src/theme/shape.js
// Defines shape-related design tokens and helpers for generating CSS variables.

export const RADIUS_PRESETS = {
  none: {
    none: '0px',
    subtle: '0px',
    soft: '0px',
    rounded: '0px',
    pill: '0px'
  },
  subtle: {
    none: '0px',
    subtle: '4px',
    soft: '8px',
    rounded: '12px',
    pill: '999px'
  },
  soft: {
    none: '0px',
    subtle: '6px',
    soft: '12px',
    rounded: '18px',
    pill: '999px'
  },
  rounded: {
    none: '0px',
    subtle: '8px',
    soft: '16px',
    rounded: '24px',
    pill: '999px'
  },
  pill: {
    none: '0px',
    subtle: '12px',
    soft: '24px',
    rounded: '48px',
    pill: '999px'
  }
};

export const SHADOW_PRESETS = {
  none: {
    none: 'none',
    lifted: 'none',
    floating: 'none',
    elevated: 'none'
  },
  lifted: {
    none: 'none',
    lifted: '0px 4px 12px rgba(15, 23, 42, 0.12)',
    floating: '0px 6px 18px rgba(15, 23, 42, 0.14)',
    elevated: '0px 10px 24px rgba(15, 23, 42, 0.18)'
  },
  floating: {
    none: 'none',
    lifted: '0px 6px 18px rgba(15, 23, 42, 0.16)',
    floating: '0px 12px 32px rgba(15, 23, 42, 0.18)',
    elevated: '0px 18px 48px rgba(15, 23, 42, 0.22)'
  },
  elevated: {
    none: 'none',
    lifted: '0px 10px 24px rgba(15, 23, 42, 0.2)',
    floating: '0px 18px 48px rgba(15, 23, 42, 0.24)',
    elevated: '0px 28px 64px rgba(15, 23, 42, 0.28)'
  }
};

export const BORDER_WIDTH_PRESETS = {
  none: {
    none: '0px',
    hairline: '0px',
    standard: '0px',
    bold: '0px'
  },
  hairline: {
    none: '0px',
    hairline: '1px',
    standard: '2px',
    bold: '3px'
  },
  standard: {
    none: '0px',
    hairline: '2px',
    standard: '3px',
    bold: '4px'
  },
  bold: {
    none: '0px',
    hairline: '3px',
    standard: '4px',
    bold: '6px'
  }
};

export const defaultRoundness = 'soft';
export const defaultShadowPreset = 'floating';
export const defaultBorderWidthPreset = 'hairline';

export const getRadiiTokens = (preset = defaultRoundness) => {
  const selected = RADIUS_PRESETS[preset] || RADIUS_PRESETS[defaultRoundness];
  return { ...selected };
};

export const getShadowTokens = (preset = defaultShadowPreset) => {
  const selected = SHADOW_PRESETS[preset] || SHADOW_PRESETS[defaultShadowPreset];
  return { ...selected };
};

export const getBorderWidthTokens = (preset = defaultBorderWidthPreset) => {
  const selected = BORDER_WIDTH_PRESETS[preset] || BORDER_WIDTH_PRESETS[defaultBorderWidthPreset];
  return { ...selected };
};
