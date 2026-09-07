import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthRequest } from 'src/auth/auth.types';
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(+id, updateRequestDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteRequest(@Param('id') requestId: string, @Req() req: AuthRequest) {
    return this.requestsService.remove(requestId, req.user);
  }
}
