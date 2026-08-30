import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CitiesModule } from './cities/cities.module';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/db.config';
import { jwtConfig } from './config/jwt.config';
import { GendersModule } from './genders/genders.module';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig(),
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    CitiesModule,
    CategoriesModule,
    GendersModule,
    SkillsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
