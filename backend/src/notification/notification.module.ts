import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [AuthModule],
  providers: [NotificationsGateway, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class NotificationModule {}
