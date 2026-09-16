import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationPayload } from './notification.types';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({ cors: true })
@Injectable()
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.wsJwtGuard.verify(client);
      await client.join(user.sub);
    } catch {
      client.disconnect();
    }
  }

  notifyUser(userId: string, payload: NotificationPayload) {
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
