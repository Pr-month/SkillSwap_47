import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiAuthTag,
  ApiLogin,
  ApiLogout,
  ApiRefresh,
  ApiRegister,
  ApiYandexCallback,
  ApiYandexLogin,
} from './auth.swagger';
import { JwtPayload, OAuthRequest, RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { YandexAuthGuard } from './guards/yandex-auth.guard';

@ApiAuthTag()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiRegister()
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('yandex/login')
  @UseGuards(YandexAuthGuard)
  @ApiYandexLogin()
  oauthLoginYandex() {
    // Passport redirect to Yandex
  }

  @Get('yandex/callback')
  @UseGuards(YandexAuthGuard)
  @ApiYandexCallback()
  oauthYandexCallback(@Req() req: OAuthRequest) {
    return this.authService.loginWithOAuth(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiRefresh()
  refresh(
    @Body() _refreshDto: RefreshDto,
    @Req() req: { user: RefreshAuthUser },
  ) {
    return this.authService.refresh(req.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiLogout()
  logout(@Req() req: { user: Pick<JwtPayload, 'sub'> }) {
    return this.authService.logout(req.user.sub);
  }
}
