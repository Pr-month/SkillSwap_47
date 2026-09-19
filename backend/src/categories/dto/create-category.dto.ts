import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Музыка',
    minLength: 1,
    maxLength: 128,
  })
  @IsString()
  @Length(1, 128)
  name!: string;

  @ApiPropertyOptional({
    description: 'ID корневой категории, если создаём подкатегорию',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
