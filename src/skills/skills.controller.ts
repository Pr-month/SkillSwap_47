import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSkillDto: CreateSkillDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.create(createSkillDto, userId);
  }

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.skillsService.remove(id, userId);
  }
}
