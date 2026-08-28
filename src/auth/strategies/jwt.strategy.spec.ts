import { IJwtConfig } from '../../config/jwt.config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config: IJwtConfig = {
    accessSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  };

  it('should be defined', () => {
    expect(new JwtStrategy(config)).toBeDefined();
  });

  it('should return the JWT payload as an authenticated user', () => {
    const strategy = new JwtStrategy(config);
    const payload = { sub: 'user-id' };

    expect(strategy.validate(payload)).toEqual(payload);
  });
});
