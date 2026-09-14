import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

export class CityResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    description: 'Название города',
    example: 'Москва',
    maxLength: 64,
  })
  name!: string;
}

export function ApiCitiesTag() {
  return applyDecorators(ApiTags('cities'));
}

export function ApiFindCities() {
  return applyDecorators(
    ApiOperation({ summary: 'Список городов' }),
    ApiOkResponse({
      description: 'Города в алфавитном порядке',
      type: [CityResponseDto],
    }),
  );
}
