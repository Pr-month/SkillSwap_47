import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserGender } from '../../common/enums/user-gender.enum';

export class WantToLearnDto {
  @ApiProperty({
    description: 'ID родительской категории',
    format: 'uuid',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    description: 'ID подкатегории, которую пользователь хочет изучить',
    format: 'uuid',
  })
  @IsUUID()
  subcategoryId!: string;
}

export class RegisterSkillDto {
  @ApiProperty({
    description: 'Название навыка',
    example: 'Игра на гитаре',
    minLength: 2,
    maxLength: 128,
  })
  @IsString()
  @Length(2, 128)
  title!: string;

  @ApiProperty({
    description: 'ID родительской категории навыка',
    format: 'uuid',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    description: 'ID подкатегории навыка',
    format: 'uuid',
  })
  @IsUUID()
  subcategoryId!: string;

  @ApiProperty({
    description: 'Описание навыка',
    example: 'Обучаю игре на акустической гитаре с нуля',
    minLength: 1,
    maxLength: 4000,
  })
  @IsString()
  @Length(1, 4000)
  description!: string;

  @ApiPropertyOptional({
    description: 'URL изображений навыка',
    type: [String],
    example: ['/uploads/skills/guitar.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Пароль',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'Имя',
    example: 'Иван',
    minLength: 2,
    maxLength: 32,
  })
  @IsString()
  @Length(2, 32)
  name!: string;

  @ApiProperty({
    description: 'Дата рождения (ISO 8601)',
    example: '1995-05-20',
  })
  @IsDateString()
  birthdate!: string;

  @ApiProperty({
    description: 'Пол',
    enum: UserGender,
    example: UserGender.MALE,
  })
  @IsEnum(UserGender)
  gender!: UserGender;

  @ApiProperty({
    description: 'Город (должен существовать в справочнике)',
    example: 'Москва',
    minLength: 1,
    maxLength: 64,
  })
  @IsString()
  @Length(1, 64)
  city!: string;

  @ApiProperty({
    description: 'Категория, которую пользователь хочет изучить',
    type: WantToLearnDto,
  })
  @ValidateNested()
  @Type(() => WantToLearnDto)
  wantToLearn!: WantToLearnDto;

  @ApiProperty({
    description: 'Навык, которым пользователь готов делиться',
    type: RegisterSkillDto,
  })
  @ValidateNested()
  @Type(() => RegisterSkillDto)
  skill!: RegisterSkillDto;
}
