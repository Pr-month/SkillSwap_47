import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserGender } from '../common/enums/user-gender.enum';
import { Roles } from '../common/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

export class AuthLoginUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Иван' })
  name!: string;

  @ApiProperty({ enum: Roles, example: Roles.USER })
  role!: Roles;
}

export class AuthPublicUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Иван' })
  name!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  about!: string | null;

  @ApiProperty({ example: '1995-05-20' })
  birthdate!: string;

  @ApiProperty({ example: 'Москва' })
  city!: string;

  @ApiProperty({ enum: UserGender, example: UserGender.MALE })
  gender!: UserGender;

  @ApiProperty({ example: '' })
  avatar!: string;

  @ApiProperty({ enum: Roles, example: Roles.USER })
  role!: Roles;

  @ApiProperty({
    description: 'Навыки пользователя',
    type: 'array',
    items: { type: 'object' },
  })
  skills!: object[];

  @ApiProperty({
    description: 'Категории, которые пользователь хочет изучить',
    type: 'array',
    items: { type: 'object' },
  })
  wantToLearn!: object[];

  @ApiProperty({
    description: 'Избранные навыки',
    type: 'array',
    items: { type: 'object' },
  })
  favoriteSkills!: object[];
}

export class AuthRegisterResponseDto {
  @ApiProperty({ type: AuthPublicUserDto })
  user!: AuthPublicUserDto;

  @ApiProperty({
    description: 'Access JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}

export class AuthLoginResponseDto {
  @ApiProperty({ example: 'Успешный вход' })
  message!: string;

  @ApiProperty({ type: AuthLoginUserDto })
  user!: AuthLoginUserDto;

  @ApiProperty({
    description: 'Access JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({
    description: 'Access JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}

export class AuthLogoutResponseDto {
  @ApiProperty({ example: 'Успешный выход' })
  message!: string;
}

export function ApiAuthTag() {
  return applyDecorators(ApiTags('auth'));
}

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация пользователя' }),
    ApiBody({ type: RegisterDto }),
    ApiCreatedResponse({
      description: 'Пользователь создан, выданы токены',
      type: AuthRegisterResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации или неизвестный город',
    }),
    ApiResponse({
      status: 409,
      description: 'Пользователь с таким email уже существует',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Вход в аккаунт' }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({
      description: 'Успешный вход',
      type: AuthLoginResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Ошибка валидации' }),
    ApiResponse({ status: 401, description: 'Неверный email или пароль' }),
  );
}

export function ApiRefresh() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление токенов',
      description:
        'Refresh-токен передаётся в теле (`refreshToken`) или в заголовке Authorization: Bearer',
    }),
    ApiBody({ type: RefreshDto }),
    ApiOkResponse({
      description: 'Новая пара токенов',
      type: AuthTokensResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Невалидный refresh токен' }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Выход из аккаунта' }),
    ApiOkResponse({
      description: 'Refresh-токен сброшен',
      type: AuthLogoutResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Требуется access-токен' }),
  );
}
