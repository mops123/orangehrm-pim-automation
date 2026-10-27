import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export const adminStorageState = '.auth/admin.json';

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
  admin: {
    username: process.env.ADMIN_USERNAME ?? 'Admin',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  },
};
