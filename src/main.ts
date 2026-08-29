import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig, IConfig } from './app.config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { appConfig, IConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
    prefix: '/uploads/',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const config = app.get<IConfig>(appConfig.KEY);
  await app.listen(config.port);
}
void bootstrap();
