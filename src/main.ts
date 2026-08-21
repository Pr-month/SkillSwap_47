import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig, IConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<IConfig>(appConfig.KEY);
  await app.listen(config.port);
}
void bootstrap();
