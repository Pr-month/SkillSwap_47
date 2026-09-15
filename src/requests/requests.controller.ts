import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { JwtPayload } from '@supabase/auth-js';
import { AuthRequest } from 'src/auth/auth.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать заявку' })
  @ApiResponse({ status: 201, description: 'Заявка создана' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на создание' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @ApiResponse({ status: 409, description: 'Такая заявка уже отправлена' })
  create(
    @CurrentUser('sub') senderId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    return this.requestsService.create(senderId, createRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список заявок' })
  @ApiResponse({ status: 200, description: 'Список заявок' })
  findAll() {
    return this.requestsService.findAll();
  }

  @Get('incoming')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить входящие заявки' })
  @ApiResponse({ status: 200, description: 'Список входящих заявок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findIncoming(@CurrentUser('sub') userId: string) {
    return this.requestsService.findIncoming(userId);
  }

  @Get('outgoing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить исходящие заявки' })
  @ApiResponse({ status: 200, description: 'Список исходящих заявок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOutgoing(@CurrentUser('sub') userId: string) {
    return this.requestsService.findOutgoing(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заявку по ID' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Заявка найдена' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновить статус заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Заявка обновлена' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на изменение' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, userId, updateRequestDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить заявку' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Заявка удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async deleteRequest(@Param('id') requestId: string, @Req() req: AuthRequest) {
    return this.requestsService.remove(requestId, req.user as JwtPayload);
  }
}
