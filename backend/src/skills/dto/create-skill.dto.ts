import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    example: 'Игра на гитаре',
    description: 'Название навыка',
    minLength: 2,
    maxLength: 128,
  })
  @IsString()
  @Length(2, 128)
  title!: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID основной категории',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    description: 'ID подкатегории',
  })
  @IsUUID()
  subcategoryId!: string;

  @ApiProperty({
    example: 'Научу играть базовые аккорды',
    description: 'Описание навыка',
    minLength: 1,
    maxLength: 4000,
  })
  @IsString()
  @Length(1, 4000)
  description!: string;

  @ApiPropertyOptional({
    example: ['/uploads/guitar.png'],
    description: 'Ссылки на изображения',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
