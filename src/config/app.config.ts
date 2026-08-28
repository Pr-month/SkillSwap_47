import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  hashSalt: process.env.HASH_SALT || 'dev_hash_salt',
}));

export type IConfig = ConfigType<typeof appConfig>;
