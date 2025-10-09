const scopes = [
  'app',
  'config',
  'docs',
  'infra',
  'public',
  'scripts',
  'server',
  'src',
  'storybook',
  'tests',
  'tokens',
  'types',
  'deps',
  'root'
]

const types = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
  'deps'
]

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', types],
    'scope-enum': [2, 'always', scopes],
    'scope-case': [2, 'always', 'kebab-case'],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'never', ['pascal-case', 'upper-case']]
  }
}
