import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-yandex';
import {
  IYandexOAuthConfig,
  yandexOAuthConfig,
} from '../../config/yandex-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(
    private readonly authService: AuthService,
    @Inject(yandexOAuthConfig.KEY)
    config: IYandexOAuthConfig,
  ) {
    super({
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
      // Confidential client + Nest without session: disable default PKCE/state store
      state: false,
      pkce: false,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Email не получен от Яндекса');
    }

    const rawName = profile.displayName?.trim() || email.split('@')[0];
    const name = rawName.slice(0, 32);
    const avatar = profile.photos?.[0]?.value ?? '';

    return this.authService.validateYandexUser({ email, name, avatar });
  }
}
