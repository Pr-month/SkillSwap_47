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
import type { JwtPayload } from '@supabase/auth-js';
import { AuthRequest } from 'src/auth/auth.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('sub') senderId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    return this.requestsService.create(senderId, createRequestDto);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get('incoming')
  @UseGuards(JwtAuthGuard)
  findIncoming(@CurrentUser('sub') userId: string) {
    return this.requestsService.findIncoming(userId);
  }

  @Get('outgoing')
  @UseGuards(JwtAuthGuard)
  findOutgoing(@CurrentUser('sub') userId: string) {
    return this.requestsService.findOutgoing(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, userId, updateRequestDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRequest(@Param('id') requestId: string, @Req() req: AuthRequest) {
    return this.requestsService.remove(requestId, req.user as JwtPayload);
  }
}
