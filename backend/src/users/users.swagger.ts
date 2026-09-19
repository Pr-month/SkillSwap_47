import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';

export function UsersTag() {
  return applyDecorators(ApiTags('users'));
}

export function UsersFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список пользователей' }),
    ApiOkResponse({
      description: 'Список пользователей',
      type: [UpdateMeDto],
    }),
  );
}

export function UsersFindMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Получить текущего пользователя' }),
    ApiOkResponse({
      description: 'Текущий пользователь',
      type: UpdateMeDto,
    }),
  );
}

export function UsersUpdateMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить текущего пользователя' }),
    ApiOkResponse({
      description: 'Пользователь обновлен',
      type: UpdateMeDto,
    }),
  );
}

export function UsersUpdatePassword() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить пароль' }),
    ApiOkResponse({
      description: 'Пользователь обновлен',
      type: UpdatePasswordDto,
    }),
  );
}

export function UsersFindOne() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Получить пользователя' }),
    ApiOkResponse({
      description: 'Пользователь',
      type: UpdateMeDto,
    }),
  );
}

export function UsersRemove() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Удалить пользователя (только ADMIN)' }),
    ApiOkResponse({
      description: 'Пользователь удален',
      type: UpdateMeDto,
    }),
  );
}
