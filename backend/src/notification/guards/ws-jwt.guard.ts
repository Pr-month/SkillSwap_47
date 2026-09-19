import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../auth/auth.types';

type SocketData = {
  user?: JwtPayload;
};

@Injectable()
export class WsJwtGuard {
  constructor(private readonly jwtService: JwtService) {}

  async verify(client: Socket): Promise<JwtPayload> {
    const token = this.readToken(client);

    if (!token) {
      throw new UnauthorizedException('Токен не передан');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    const data = client.data as SocketData;
    data.user = payload;

    return payload;
  }

  private readToken(client: Socket): string | undefined {
    const token = client.handshake.query?.token;

    if (typeof token === 'string' && token.length > 0) {
      return token;
    }

    if (Array.isArray(token) && typeof token[0] === 'string') {
      return token[0];
    }

    return undefined;
  }
}
