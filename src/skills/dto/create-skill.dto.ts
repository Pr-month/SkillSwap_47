import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateSkillDto {
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
