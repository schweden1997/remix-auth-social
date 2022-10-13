module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint'],

  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],

  ignorePatterns: ['node_modules', 'dist', 'coverage', 'build'],
}
