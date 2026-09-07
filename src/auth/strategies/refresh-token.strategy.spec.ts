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
});
