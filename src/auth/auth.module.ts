import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { jwtConfig, IJwtConfig } from '../jwt.config';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: IJwtConfig) => ({
        secret: config.accessSecret,
        signOptions: {
          expiresIn: config.accessExpiresIn as StringValue,
        },
      }),
      inject: [jwtConfig.KEY],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
