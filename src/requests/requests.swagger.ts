import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

export function ApiRequestsTag() {
  return applyDecorators(ApiTags('requests'));
}

export function ApiCreateRequest() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Создать заявку' }),
    ApiBody({ type: CreateRequestDto }),
    ApiCreatedResponse({ description: 'Заявка создана' }),
    ApiResponse({ status: 400, description: 'Невалидные данные' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав на создание' }),
    ApiResponse({ status: 404, description: 'Навык не найден' }),
    ApiResponse({ status: 409, description: 'Такая заявка уже отправлена' }),
  );
}

export function ApiFindRequests() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список заявок' }),
    ApiOkResponse({ description: 'Список заявок' }),
  );
}

export function ApiFindIncomingRequests() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Получить входящие заявки' }),
    ApiOkResponse({ description: 'Список входящих заявок' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

export function ApiFindOutgoingRequests() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Получить исходящие заявки' }),
    ApiOkResponse({ description: 'Список исходящих заявок' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
  );
}

export function ApiFindRequest() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить заявку по ID' }),
    ApiParam({ name: 'id', description: 'ID заявки' }),
    ApiOkResponse({ description: 'Заявка найдена' }),
  );
}

export function ApiUpdateRequest() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить статус заявки' }),
    ApiParam({ name: 'id', description: 'ID заявки' }),
    ApiBody({ type: UpdateRequestDto }),
    ApiOkResponse({ description: 'Заявка обновлена' }),
    ApiResponse({ status: 400, description: 'Невалидные данные' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав на изменение' }),
    ApiResponse({ status: 404, description: 'Заявка не найдена' }),
  );
}

export function ApiRemoveRequest() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Удалить заявку' }),
    ApiParam({ name: 'id', description: 'ID заявки' }),
    ApiOkResponse({ description: 'Заявка удалена' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав на удаление' }),
    ApiResponse({ status: 404, description: 'Заявка не найдена' }),
  );
}
