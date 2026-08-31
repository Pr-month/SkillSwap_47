import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { UserGender } from '../../common/enums/user-gender.enum';

export class UpdateWantToLearnDto {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  subcategoryId!: string;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(2, 32)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  about?: string | null;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatar?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWantToLearnDto)
  wantToLearn?: UpdateWantToLearnDto;
}
