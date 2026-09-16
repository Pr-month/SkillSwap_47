import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/auth.types';
import { NotificationPayload } from './notification.types';

@WebSocketGateway({ cors: true })
@Injectable()
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = this.readToken(client);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      await client.join(payload.sub);
    } catch {
      client.disconnect();
    }
  }

  notifyUser(userId: string, payload: NotificationPayload) {
    this.server.to(userId).emit('notificateNewRequest', payload);
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
