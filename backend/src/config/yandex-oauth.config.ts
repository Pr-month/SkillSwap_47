import { ConfigType, registerAs } from '@nestjs/config';

export const yandexOAuthConfig = registerAs('YANDEX_OAUTH_CONFIG', () => ({
  clientID: process.env.YANDEX_CLIENT_ID || '',
  clientSecret: process.env.YANDEX_CLIENT_SECRET || '',
  callbackURL:
    process.env.YANDEX_CALLBACK_URL ||
    'http://localhost:3000/api/auth/yandex/callback',
  frontendRedirectURL:
    process.env.FRONTEND_OAUTH_REDIRECT_URL || 'http://localhost:8080/',
}));

export type IYandexOAuthConfig = ConfigType<typeof yandexOAuthConfig>;
