import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { appConfig, IConfig } from '../app.config';
import { hashToken, verifyPassword } from '../common/utils/password.util';
import { jwtConfig, IJwtConfig } from '../jwt.config';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './auth.types';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(appConfig.KEY) private readonly appCfg: IConfig,
    @Inject(jwtConfig.KEY) private readonly jwtCfg: IJwtConfig,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });

    if (
      !user ||
      !verifyPassword(loginDto.password, this.appCfg.hashSalt, user.password)
    ) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtCfg.refreshSecret,
      expiresIn: this.jwtCfg.refreshExpiresIn as StringValue,
    });

    await this.usersRepository.update(user.id, {
      refreshToken: hashToken(refreshToken, this.appCfg.hashSalt),
    });

    const accessMaxAgeMs = this.parseExpiresInToMs(this.jwtCfg.accessExpiresIn);
    const refreshMaxAgeMs = this.parseExpiresInToMs(
      this.jwtCfg.refreshExpiresIn,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: accessMaxAgeMs,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: refreshMaxAgeMs,
    });

    return {
      message: 'Успешный вход',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  create(createAuthDto: CreateAuthDto) {
    console.log(createAuthDto); //ВРЕМЕННО: для линтера
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    console.log(updateAuthDto); //ВРЕМЕННО: для линтера
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private parseExpiresInToMs(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/i.exec(expiresIn);

    if (!match) {
      return 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
