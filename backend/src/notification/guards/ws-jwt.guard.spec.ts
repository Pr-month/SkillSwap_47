import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Roles } from '../../common/enums/user-role.enum';
import { JwtPayload } from '../../auth/auth.types';
import { WsJwtGuard } from './ws-jwt.guard';

type SocketData = {
  user?: JwtPayload;
};

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let verifyAsync: jest.Mock;

  const payload: JwtPayload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: Roles.USER,
  };

  const createClient = (token?: string | string[]): Socket =>
    ({
      handshake: { query: token === undefined ? {} : { token } },
      data: {} as SocketData,
    }) as Socket;

  const getUser = (client: Socket): JwtPayload | undefined =>
    (client.data as SocketData).user;

  beforeEach(() => {
    verifyAsync = jest.fn();
    guard = new WsJwtGuard({ verifyAsync } as unknown as JwtService);
  });

  it('sets client.data.user and returns payload for a valid token', async () => {
    verifyAsync.mockResolvedValue(payload);
    const client = createClient('access-token');

    await expect(guard.verify(client)).resolves.toEqual(payload);
    expect(verifyAsync).toHaveBeenCalledWith('access-token');
    expect(getUser(client)).toEqual(payload);
  });

  it('uses the first token when query.token is an array', async () => {
    verifyAsync.mockResolvedValue(payload);
    const client = createClient(['first-token', 'second-token']);

    await expect(guard.verify(client)).resolves.toEqual(payload);
    expect(verifyAsync).toHaveBeenCalledWith('first-token');
    expect(getUser(client)).toEqual(payload);
  });

  it('throws when token is missing', async () => {
    const client = createClient();

    await expect(guard.verify(client)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyAsync).not.toHaveBeenCalled();
    expect(getUser(client)).toBeUndefined();
  });

  it('throws when token is invalid and does not set user', async () => {
    verifyAsync.mockRejectedValue(new Error('invalid token'));
    const client = createClient('bad-token');

    await expect(guard.verify(client)).rejects.toThrow('invalid token');
    expect(getUser(client)).toBeUndefined();
  });
});
