import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const spacingKeys = Array.from({ length: 17 }, (_, index) => index)

const spacingScale = spacingKeys.reduce((acc, key) => {
  if (key === 0) {
    acc[key] = '0rem'
  } else {
    acc[key] = `calc(var(--spacing-${key}) * var(--density-multiplier, 1))`
  }
  return acc
}, {})

const resolveSharedSrcPath = () => {
  const candidates = [
    process.env.SHARED_FRONTEND_PATH,
    path.resolve(__dirname, '../FRONTEND/src'),
  ].filter(Boolean)

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (existsSync(resolved)) {
      return resolved
    }
  }

  return null
}

const sharedSrcPath = resolveSharedSrcPath()

const sharedContentGlobs = sharedSrcPath
  ? [
      path.join(sharedSrcPath, 'SITES/**/*.{js,jsx,ts,tsx,css}'),
      path.join(sharedSrcPath, 'components/**/*.{js,jsx,ts,tsx,css}'),
    ]
  : []

const config = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,css}',
    ...sharedContentGlobs,
  ],
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
}

export default config

