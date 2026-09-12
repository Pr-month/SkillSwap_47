import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local', override: true });
process.env.NODE_ENV = 'test';

execSync(
  [
    'npm run clear-db',
    'npm run seed:cities',
    'npm run seed:categories',
    'npm run seed:admin',
    'npm run seed:users',
    'npm run seed:skills',
    'jest --config ./test/jest-e2e.json',
  ].join(' && '),
  { stdio: 'inherit', env: process.env },
);
