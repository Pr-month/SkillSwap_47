import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  IYandexOAuthConfig,
  yandexOAuthConfig,
} from '../config/yandex-oauth.config';
import { User } from '../users/entities/user.entity';
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
import { JwtPayload, RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { YandexAuthGuard } from './guards/yandex-auth.guard';

@ApiAuthTag()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(yandexOAuthConfig.KEY)
    private readonly yandexOAuth: IYandexOAuthConfig,
  ) {}

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
  yandexLogin() {
    // Passport redirects to Yandex
  }

  @Get('yandex/callback')
  @UseGuards(YandexAuthGuard)
  @ApiYandexCallback()
  async yandexCallback(
    @Req() req: { user: User },
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.completeOAuthLogin(req.user);
    const redirectBase = this.yandexOAuth.frontendRedirectURL;
    const url = new URL(redirectBase);
    url.searchParams.set('accessToken', tokens.accessToken);
    url.searchParams.set('refreshToken', tokens.refreshToken);
    res.redirect(url.toString());
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
