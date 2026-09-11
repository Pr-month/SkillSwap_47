import { Roles } from '../../common/enums/user-role.enum';
import { IJwtConfig } from '../../config/jwt.config';
import { RefreshTokenStrategy } from './refresh-token.strategy';

describe('RefreshTokenStrategy', () => {
  const config: IJwtConfig = {
    accessSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  };

  it('should be defined', () => {
    expect(new RefreshTokenStrategy(config)).toBeDefined();
  });

  it('should return payload with refresh token from body', () => {
    const strategy = new RefreshTokenStrategy(config);
    const payload = {
      sub: 'user-id',
      email: 'user@mail.com',
      role: Roles.USER,
    };

    expect(
      strategy.validate(
        { body: { refreshToken: 'refresh-jwt' } } as never,
        payload as never,
      ),
    ).toEqual({
      ...payload,
      refreshToken: 'refresh-jwt',
    });
  });

  it('should take refresh token from Authorization header when body is empty', () => {
    const strategy = new RefreshTokenStrategy(config);
    const payload = {
      sub: 'user-id',
      email: 'user@mail.com',
      role: Roles.USER,
    };

    expect(
      strategy.validate(
        {
          body: {},
          headers: { authorization: 'Bearer header-refresh' },
        } as never,
        payload as never,
      ),
    ).toEqual({
      ...payload,
      refreshToken: 'header-refresh',
    });
  });

  it('should return empty refresh token when it is missing', () => {
    const strategy = new RefreshTokenStrategy(config);

    expect(
      strategy.validate({ body: {}, headers: {} } as never, {
        sub: 'user-id',
        email: 'user@mail.com',
        role: Roles.USER,
      } as never),
    ).toEqual({
      sub: 'user-id',
      email: 'user@mail.com',
      role: Roles.USER,
      refreshToken: '',
    });
  });
});
