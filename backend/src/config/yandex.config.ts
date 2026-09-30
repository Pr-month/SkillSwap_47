import { ConfigType, registerAs } from '@nestjs/config';

export const yandexConfig = registerAs('YANDEX_CONFIG', () => ({
  clientID: process.env.YANDEX_CLIENT_ID || '',
  clientSecret: process.env.YANDEX_CLIENT_SECRET || '',
  callbackURL:
    process.env.YANDEX_CALLBACK_URL ||
    'http://localhost:3000/auth/yandex/callback',
}));

export type IYandexConfig = ConfigType<typeof yandexConfig>;
