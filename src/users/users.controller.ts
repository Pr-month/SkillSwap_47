import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles as UserRole } from '../common/enums/user-role.enum';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';
import { UsersTag, UsersFindAll, UsersFindMe, UsersUpdateMe, UsersUpdatePassword, UsersFindOne, UsersRemove } from './users.swagger';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@UsersTag()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UsersFindAll()
  findAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UsersFindMe()
  findMe(@CurrentUser('sub') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UsersUpdateMe()
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(userId, updateMeDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @UsersUpdatePassword()
  updateMyPassword(
    @CurrentUser('sub') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, updatePasswordDto);
  }

  @Get(':id')
  @UsersFindOne()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsersRemove()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
