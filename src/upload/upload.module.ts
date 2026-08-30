import { Module } from '@nestjs/common';
import { MulterExceptionFilter } from './multer-exception.filter';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, MulterExceptionFilter],
})
export class UploadModule {}
