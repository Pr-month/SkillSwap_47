import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills-query.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthRequest } from '../auth/auth.types';

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

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  addToFavorites(
    @Param('id') skillId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.addToFavorites(skillId, userId);
  }

  @Get()
  findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
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
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.skillsService.remove(id, userId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFavorite(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.skillsService.removeFavorite(id, req.user.id);
  }
}
