import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    ...tsJestTransformCfg,
  },
  setupFiles: ['<rootDir>/jest.setup.ts']
};

export default config;
