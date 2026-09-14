import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills-query.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthRequest } from '../auth/auth.types';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать навык' })
  @ApiResponse({ status: 201, description: 'Навык создан' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  create(
    @Body() createSkillDto: CreateSkillDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.create(createSkillDto, userId);
  }

  @Post(':id/favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Добавить навык в избранное' })
  @ApiParam({ name: 'id', description: 'ID навыка' })
  @ApiResponse({ status: 201, description: 'Навык добавлен в избранное' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @ApiResponse({ status: 409, description: 'Навык уже в избранном' })
  addToFavorites(
    @Param('id') skillId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.addToFavorites(skillId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список навыков' })
  @ApiResponse({ status: 200, description: 'Список навыков' })
  @ApiResponse({ status: 404, description: 'Страница не найдена' })
  findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id/similar')
  findSimilar(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.findSimilar(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить навык по ID' })
  @ApiParam({ name: 'id', description: 'ID навыка' })
  @ApiResponse({ status: 200, description: 'Навык найден' })
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновить навык' })
  @ApiParam({ name: 'id', description: 'ID навыка' })
  @ApiResponse({ status: 200, description: 'Навык обновлён' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на изменение' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.update(id, updateSkillDto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить навык' })
  @ApiParam({ name: 'id', description: 'ID навыка' })
  @ApiResponse({ status: 204, description: 'Навык удалён' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.skillsService.remove(id, userId);
  }

  @Delete(':id/favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Убрать навык из избранного' })
  @ApiParam({ name: 'id', description: 'ID навыка' })
  @ApiResponse({ status: 204, description: 'Навык убран из избранного' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  removeFavorite(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.skillsService.removeFavorite(id, req.user.sub);
  }
}
