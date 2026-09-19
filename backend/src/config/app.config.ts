import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  saltRounds: Number(process.env.SALT_ROUNDS) || 10,
}));

export type IConfig = ConfigType<typeof appConfig>;
