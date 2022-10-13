import type { Config } from '@jest/types'

import * as path from 'path'

const config: Config.InitialOptions = {
  verbose: Boolean(process.env.CI),
  rootDir: path.resolve('.'),
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  transform: {
    '\\.[jt]sx?$': ['babel-jest', { configFile: './config/babel.config.js' }],
  },
}

export default config
