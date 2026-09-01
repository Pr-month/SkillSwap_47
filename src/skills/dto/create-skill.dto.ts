import { IsArray, IsString, IsUUID, Length, IsNotEmpty } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsUUID()
  categoryId!: string;
}
