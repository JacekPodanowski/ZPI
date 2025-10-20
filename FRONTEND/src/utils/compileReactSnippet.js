const AVAILABLE_PARSER_PLUGINS = [
  'jsx',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'optionalChaining',
  'nullishCoalescingOperator',
  'topLevelAwait',
  'decorators-legacy',
  'typescript'
]

const compileReactSnippet = (babel, source) => {
  if (!babel) {
    throw new Error('Środowisko Babel nie jest dostępne.');
  }

  const rawSource = typeof source === 'string' ? source.trim() : ''
  if (!rawSource.length) {
    throw new Error('Kod komponentu jest pusty.');
  }

  const jsxPlugin = babel.availablePlugins?.['transform-react-jsx'] || 'transform-react-jsx'

  const { code } = babel.transform(rawSource, {
    filename: 'inline-component.jsx',
    babelrc: false,
    configFile: false,
    plugins: [[jsxPlugin, { runtime: 'classic', useSpread: true }]],
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: AVAILABLE_PARSER_PLUGINS
    },
    generatorOpts: {
      compact: true,
      retainLines: false,
      comments: false
    }
  })

  const trimmed = (code || '').trim()
  if (!trimmed.length) {
    throw new Error('Transformacja Babel nie zwróciła kodu.');
  }

  return trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed
}

export default compileReactSnippet
