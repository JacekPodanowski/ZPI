// src/theme/typography.js

/**
 * Unified typography configuration used by the theme generator.
 * Keep this file free from component-specific imports.
 */

export const typography = {
  fonts: {
    heading: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    accent: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    logo: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    handwritten: '"Birthstone", cursive',
    elegantScript: '"Satisfy", cursive',
    artisticCasual: '"Amatic SC", cursive',
    signature: '"Great Vibes", cursive'
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em'
  }
};

export const textStyles = {
  display: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['6xl'],
    fontWeight: typography.weights.extrabold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  h4: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  h5: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  h6: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  bodyLarge: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.relaxed,
    letterSpacing: typography.letterSpacing.normal
  },
  body: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  bodySmall: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  button: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'none'
  },
  label: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  caption: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  code: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  logo: {
    fontFamily: typography.fonts.logo,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.extrabold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  handwritten: {
    fontFamily: typography.fonts.handwritten,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  elegantScript: {
    fontFamily: typography.fonts.elegantScript,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  artisticCasual: {
    fontFamily: typography.fonts.artisticCasual,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  signature: {
    fontFamily: typography.fonts.signature,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  handwritten1: {
    fontFamily: typography.fonts.handwritten1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  handwritten2: {
    fontFamily: typography.fonts.handwritten2,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal
  }
};

export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Raleway:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Exo+2:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700;1,800;1,900&family=JetBrains+Mono:wght@400;500;600&family=Pacifico&family=Satisfy&family=Amatic+SC:wght@400;700&family=Great+Vibes&family=Birthstone&family=Ephesis&display=swap';

export function getTextStyle(styleName) {
  return textStyles[styleName] || textStyles.body;
}