// src/theme/colorSystem.js
// Generates semantic color systems from minimal theme definitions.

import chroma from 'chroma-js';
import { typography, textStyles } from './typography';

const SHADE_KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const clampLab = (value) => Math.min(Math.max(value, 0), 100);

const toKebabCase = (value) => value.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();

const mix = (colorA, colorB, ratio) => chroma.mix(colorA, colorB, ratio, 'lab').hex();

const withAlpha = (color, alpha) => chroma(color).alpha(alpha).hex();

export function generateColorScale(baseColor) {
  const base = chroma(baseColor);
  const lighten = base.set('lab.l', clampLab(base.get('lab.l') + 35));
  const darken = base.set('lab.l', clampLab(base.get('lab.l') - 35));
  const scale = chroma.scale([lighten, base, darken]).mode('lab').correctLightness();

  return SHADE_KEYS.reduce((acc, key, index) => {
    const position = index / (SHADE_KEYS.length - 1);
    acc[key] = scale(position).hex();
    return acc;
  }, {});
}

export function checkContrast(foreground, background) {
  const contrast = chroma.contrast(foreground, background);
  return {
    contrast: Number(contrast.toFixed(2)),
    passesAA: contrast >= 4.5,
    passesAAA: contrast >= 7
  };
}

export function createTheme(definition, requestedMode = 'light') {
  const safeMode = requestedMode === 'dark' ? 'dark' : 'light';
  const baseColors = definition[safeMode];
  const isLight = safeMode === 'light';

  const backgroundScale = generateColorScale(baseColors.background);
  const textScale = generateColorScale(baseColors.text);
  const primaryScale = generateColorScale(baseColors.primary);
  const secondaryScale = generateColorScale(baseColors.secondary);

  const page = isLight ? backgroundScale[100] : backgroundScale[900];
  const surface = isLight ? backgroundScale[50] : backgroundScale[800];
  const elevated = isLight ? mix(page, '#ffffff', 0.12) : mix(page, '#ffffff', 0.18);
  const subtle = isLight ? mix(page, '#ffffff', 0.2) : mix(page, '#000000', 0.25);
  const hover = isLight ? mix(page, primaryScale[100], 0.18) : mix(page, '#ffffff', 0.12);

  const colors = {
    brand: {
      primary: baseColors.primary,
      secondary: baseColors.secondary,
      text: baseColors.text
    },
    bg: {
      page,
      surface,
      elevated,
      subtle,
      hover
    },
    text: {
      primary: baseColors.text,
      secondary: mix(baseColors.text, page, isLight ? 0.4 : 0.3),
      disabled: withAlpha(baseColors.text, isLight ? 0.38 : 0.32),
      inverse: isLight ? mix('#ffffff', baseColors.text, 0.1) : mix('#ffffff', page, 0.85),
      link: primaryScale[500]
    },
    interactive: {
      default: primaryScale[500],
      hover: primaryScale[600],
      active: primaryScale[700],
      disabled: withAlpha(primaryScale[500], 0.4),
      subtle: withAlpha(primaryScale[500], isLight ? 0.12 : 0.2),
      alternative: secondaryScale[500]
    },
    calendar: {
      event: mix(primaryScale[500], '#ffffff', 0.05),
      eventGroup: mix(secondaryScale[500], '#ffffff', 0.05),
      availability: withAlpha(secondaryScale[400], isLight ? 0.65 : 0.55),
      gridLine: withAlpha(textScale[400], isLight ? 0.18 : 0.26),
      otherSiteEvent: withAlpha(secondaryScale[600], 0.35)
    },
    border: {
      default: withAlpha(textScale[500], isLight ? 0.18 : 0.28),
      subtle: withAlpha(textScale[500], isLight ? 0.1 : 0.2),
      strong: withAlpha(textScale[500], isLight ? 0.32 : 0.4)
    },
    states: {
      focus: withAlpha(primaryScale[500], 0.25),
      critical: primaryScale[700],
      success: mix(secondaryScale[500], '#3AA76D', 0.4),
      info: primaryScale[400]
    },
    shadow: {
      soft: withAlpha('#000000', isLight ? 0.12 : 0.4),
      medium: withAlpha('#000000', isLight ? 0.16 : 0.48)
    }
  };

  const contrast = {
    textOnPage: checkContrast(colors.text.primary, colors.bg.page),
    primaryOnPage: checkContrast(colors.interactive.default, colors.bg.page),
    inverseOnPrimary: checkContrast(colors.text.inverse, colors.interactive.default)
  };

  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    mode: safeMode,
    baseColors,
    palettes: {
      background: backgroundScale,
      text: textScale,
      primary: primaryScale,
      secondary: secondaryScale
    },
    colors,
    typography,
    textStyles,
    contrast
  };
}

export function assignCssVariables(root, theme) {
  const setGroup = (prefix, value) => {
    Object.entries(value).forEach(([key, token]) => {
      if (token && typeof token === 'object' && !Array.isArray(token)) {
        setGroup(`${prefix}-${toKebabCase(key)}`, token);
      } else if (typeof token === 'string') {
        root.style.setProperty(`${prefix}-${toKebabCase(key)}`, token);
      }
    });
  };

  setGroup('--color', theme.colors);

  Object.entries(theme.typography.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${toKebabCase(key)}`, value);
  });
  Object.entries(theme.typography.sizes).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${toKebabCase(key)}`, value);
  });
  Object.entries(theme.typography.weights).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${toKebabCase(key)}`, value.toString());
  });
  Object.entries(theme.typography.lineHeights).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${toKebabCase(key)}`, value.toString());
  });
}
