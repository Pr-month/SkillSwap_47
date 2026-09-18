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
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills-query.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthRequest } from '../auth/auth.types';
import {
  ApiAddSkillToFavorites,
  ApiCreateSkill,
  ApiFindSkill,
  ApiFindSkills,
  ApiRemoveSkill,
  ApiRemoveSkillFromFavorites,
  ApiSkillsTag,
  ApiUpdateSkill,
} from './skills.swagger';

@ApiSkillsTag()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreateSkill()
  create(
    @Body() createSkillDto: CreateSkillDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.create(createSkillDto, userId);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiAddSkillToFavorites()
  addToFavorites(
    @Param('id') skillId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.addToFavorites(skillId, userId);
  }

  @Get()
  @ApiFindSkills()
  findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id/similar')
  findSimilar(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.findSimilar(id);
  }

  @Get(':id')
  @ApiFindSkill()
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateSkill()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.skillsService.update(id, updateSkillDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemoveSkill()
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.skillsService.remove(id, userId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemoveSkillFromFavorites()
  removeFavorite(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.skillsService.removeFavorite(id, req.user.sub);
  }
}
