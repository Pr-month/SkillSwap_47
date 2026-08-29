import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../users/users.enums';
import { JwtPayload } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createContext = (user?: JwtPayload): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when roles metadata is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should allow access when user role matches required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);

    const user: JwtPayload = {
      sub: '1',
      email: 'admin@example.com',
      role: Roles.ADMIN,
    };

    expect(guard.canActivate(createContext(user))).toBe(true);
  });

  it('should deny access when user role does not match required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);

    const user: JwtPayload = {
      sub: '1',
      email: 'user@example.com',
      role: Roles.USER,
    };

    expect(guard.canActivate(createContext(user))).toBe(false);
  });

  it('should deny access when user is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);

    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('should read roles metadata key', () => {
    const getAllAndOverrideSpy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(undefined);
    const context = createContext();

    guard.canActivate(context);

    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
