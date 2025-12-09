import boundaries from 'eslint-plugin-boundaries'

const elements = [
  { type: 'app', pattern: 'apps/*/src' },
  { type: 'feature', pattern: 'packages/features/src/*', capture: ['feature'] },
  { type: 'ui', pattern: 'packages/ui/src' },
  { type: 'core', pattern: 'packages/core/src' },
  { type: 'api', pattern: 'packages/api/src' },
  { type: 'config', pattern: 'packages/config/src' },
]

const elementTypeRules = {
  'boundaries/element-types': [
    'error',
    {
      default: 'allow',
      rules: [
        {
          from: 'app',
          disallow: ['app'],
          message: 'Apps must not import other apps directly.',
        },
        {
          from: [['feature', { feature: '*' }]],
          disallow: [['feature', { feature: '!${from.feature}' }]],
          message:
            'Features should stay isolated; depend on shared ui/core/api layers instead of other features.',
        },
      ],
    },
  ],
}

const boundariesConfig = {
  name: 'boundaries',
  files: ['{app,apps,packages}/**/*.{js,jsx,ts,tsx}'],
  plugins: { boundaries },
  settings: {
    'boundaries/include': ['app/**/*', 'apps/**/*', 'packages/**/*'],
    'boundaries/elements': elements,
  },
  rules: {
    ...elementTypeRules,
  },
}

export default boundariesConfig
