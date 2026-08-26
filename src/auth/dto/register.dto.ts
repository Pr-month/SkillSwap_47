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
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  subcategoryId!: string;
}

export class RegisterSkillDto {
  @IsString()
  @Length(2, 128)
  title!: string;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  subcategoryId!: string;

  @IsString()
  @Length(1, 4000)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Length(2, 32)
  name!: string;

  @IsDateString()
  birthdate!: string;

  @IsEnum(UserGender)
  gender!: UserGender;

  @IsString()
  @Length(1, 64)
  city!: string;

  @ValidateNested()
  @Type(() => WantToLearnDto)
  wantToLearn!: WantToLearnDto;

  @ValidateNested()
  @Type(() => RegisterSkillDto)
  skill!: RegisterSkillDto;
}
