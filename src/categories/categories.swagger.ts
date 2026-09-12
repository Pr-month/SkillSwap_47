import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryTreeDto } from './dto/category-tree.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export class CategoryMutationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Музыка' })
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    format: 'uuid',
    example: null,
  })
  parentId!: string | null;
}

export function ApiCategoriesTag() {
  return applyDecorators(ApiTags('categories'));
}

export function ApiFindCategoryTree() {
  return applyDecorators(
    ApiOperation({ summary: 'Дерево категорий и подкатегорий' }),
    ApiOkResponse({
      description: 'Список корневых категорий с детьми',
      type: [CategoryTreeDto],
    }),
  );
}

export function ApiCreateCategory() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Создать категорию (только администратор)' }),
    ApiBody({ type: CreateCategoryDto }),
    ApiCreatedResponse({
      description: 'Категория создана',
      type: CategoryMutationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации или родитель не корневой',
    }),
    ApiResponse({ status: 401, description: 'Требуется access-токен' }),
    ApiResponse({ status: 403, description: 'Недостаточно прав' }),
    ApiResponse({
      status: 404,
      description: 'Родительская категория не найдена',
    }),
  );
}

export function ApiUpdateCategory() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить категорию (только администратор)' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: UpdateCategoryDto }),
    ApiOkResponse({
      description: 'Категория обновлена',
      type: CategoryMutationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации или недопустимая смена родителя',
    }),
    ApiResponse({ status: 401, description: 'Требуется access-токен' }),
    ApiResponse({ status: 403, description: 'Недостаточно прав' }),
    ApiResponse({
      status: 404,
      description: 'Категория или родитель не найдены',
    }),
  );
}

export function ApiRemoveCategory() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Удалить категорию (только администратор)' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiNoContentResponse({ description: 'Категория удалена' }),
    ApiResponse({ status: 401, description: 'Требуется access-токен' }),
    ApiResponse({ status: 403, description: 'Недостаточно прав' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
    ApiResponse({
      status: 409,
      description: 'Нельзя удалить категорию, пока к ней привязаны навыки',
    }),
  );
}
