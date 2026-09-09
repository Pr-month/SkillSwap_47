import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 128)
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
