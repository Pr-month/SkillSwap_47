import { Module } from '@nestjs/common';
import { GendersController } from './genders.controller';

@Module({
  controllers: [GendersController],
})
export class GendersModule {}
