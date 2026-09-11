import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('SkillSwap')
  .setDescription('API платформы обмена навыками')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
