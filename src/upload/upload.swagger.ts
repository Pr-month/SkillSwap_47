import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Изображение (jpeg, png, webp), до 2 МБ',
  })
  file!: string;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Публичный URL загруженного файла',
    example: '/uploads/3f1c0c2a-9b4e-4c1a-8d2f-1a2b3c4d5e6f.png',
  })
  url!: string;
}

export function ApiUploadTag() {
  return applyDecorators(ApiTags('upload'));
}

export function ApiUploadFile() {
  return applyDecorators(
    ApiOperation({ summary: 'Загрузить изображение' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: UploadFileDto }),
    ApiCreatedResponse({
      description: 'Файл сохранён',
      type: UploadResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Файл не передан или недопустимый тип',
    }),
    ApiResponse({
      status: 413,
      description: 'Файл слишком большой',
    }),
  );
}
