/** @type {import('tailwindcss').Config} */

const spacingKeys = Array.from({ length: 17 }, (_, index) => index);

const spacingScale = spacingKeys.reduce((acc, key) => {
  if (key === 0) {
    acc[key] = '0rem';
  } else {
    acc[key] = `calc(var(--spacing-${key}) * var(--density-multiplier, 1))`;
  }
  return acc;
}, {});

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-subtle)',
        DEFAULT: 'var(--radius-soft)',
        md: 'var(--radius-soft)',
        lg: 'var(--radius-rounded)',
        xl: 'var(--radius-rounded)',
        full: 'var(--radius-pill)'
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        sm: 'var(--shadow-lifted)',
        DEFAULT: 'var(--shadow-floating)',
        lg: 'var(--shadow-elevated)'
      },
      borderWidth: {
        DEFAULT: 'var(--border-hairline)',
        0: 'var(--border-none)',
        hairline: 'var(--border-hairline)',
        standard: 'var(--border-standard)',
        bold: 'var(--border-bold)'
      },
      spacing: spacingScale
    }
  },
  plugins: []
};

