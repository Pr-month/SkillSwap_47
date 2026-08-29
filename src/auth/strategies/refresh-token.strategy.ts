import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtConfig, jwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../auth.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(@Inject(jwtConfig.KEY) config: IJwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = (req?.body as { refreshToken?: string } | undefined)
            ?.refreshToken;
          return token ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const bodyToken = (req.body as { refreshToken?: string } | undefined)
      ?.refreshToken;
    const headerToken = bodyToken
      ? null
      : ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    return {
      ...payload,
      refreshToken: bodyToken ?? headerToken ?? '',
    };
  }
}
