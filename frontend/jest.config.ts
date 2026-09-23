import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  //   setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  clearMocks: true,

  collectCoverage: true,

  collectCoverageFrom: [
    'src/entities/user/model/**/*.{ts,tsx}',
    'src/entities/Skill/model/**/*.{ts,tsx}',
    'src/features/registration/**/*.{ts,tsx}',
    'src/app/store/**/*.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
}

export default config
