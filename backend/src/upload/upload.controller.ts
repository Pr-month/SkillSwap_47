import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterExceptionFilter } from './multer-exception.filter';
import { multerOptions } from './multer.options';
import { ApiUploadFile, ApiUploadTag } from './upload.swagger';
import { UploadService } from './upload.service';

@ApiUploadTag()
@Controller('upload')
@UseFilters(MulterExceptionFilter)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiUploadFile()
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    return this.uploadService.getPublicUrl(file.filename);
  }
}
