import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CitiesModule } from './cities/cities.module';
import { appConfig } from './config/app.config';
import { databaseConfig, type IDatabaseConfig } from './config/db.config';
import { jwtConfig } from './config/jwt.config';
import { GendersModule } from './genders/genders.module';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { NotificationModule } from './notification/notification.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: IDatabaseConfig) => ({
        ...config,
        autoLoadEntities: true,
      }),
      inject: [databaseConfig.KEY],
    }),
    UsersModule,
    AuthModule,
    CitiesModule,
    CategoriesModule,
    GendersModule,
    SkillsModule,
    UploadModule,
    RequestsModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
