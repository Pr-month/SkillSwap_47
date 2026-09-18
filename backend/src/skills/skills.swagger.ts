import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

export function ApiSkillsTag() {
  return applyDecorators(ApiTags('skills'));
}

export function ApiCreateSkill() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Создать навык' }),
    ApiBody({ type: CreateSkillDto }),
    ApiCreatedResponse({ description: 'Навык создан' }),
    ApiResponse({ status: 400, description: 'Невалидные данные' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

export function ApiAddSkillToFavorites() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Добавить навык в избранное' }),
    ApiParam({ name: 'id', description: 'ID навыка' }),
    ApiCreatedResponse({ description: 'Навык добавлен в избранное' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
    ApiResponse({ status: 409, description: 'Навык уже в избранном' }),
  );
}

export function ApiFindSkills() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список навыков' }),
    ApiOkResponse({ description: 'Список навыков' }),
    ApiResponse({ status: 404, description: 'Страница не найдена' }),
  );
}

export function ApiFindSkill() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить навык по ID' }),
    ApiParam({ name: 'id', description: 'ID навыка' }),
    ApiOkResponse({ description: 'Навык найден' }),
  );
}

export function ApiUpdateSkill() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить навык' }),
    ApiParam({ name: 'id', description: 'ID навыка' }),
    ApiBody({ type: UpdateSkillDto }),
    ApiOkResponse({ description: 'Навык обновлён' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав на изменение' }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
  );
}

export function ApiRemoveSkill() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Удалить навык' }),
    ApiParam({ name: 'id', description: 'ID навыка' }),
    ApiNoContentResponse({ description: 'Навык удалён' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав на удаление' }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
  );
}

export function ApiRemoveSkillFromFavorites() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Убрать навык из избранного' }),
    ApiParam({ name: 'id', description: 'ID навыка' }),
    ApiNoContentResponse({ description: 'Навык убран из избранного' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
  );
}
