import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {

  @ApiProperty({
    example: 'CurrentPassword123!',
    description: 'Текущий действующий пароль пользователя',
    format: 'password',
  })
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    example: 'NewSecurePassword2026!',
    description: 'Новый пароль',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
