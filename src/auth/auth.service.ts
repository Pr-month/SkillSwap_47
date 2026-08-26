import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import type { StringValue } from 'ms';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { appConfig, IConfig } from '../app.config';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../cities/cities.service';
import { hashToken, verifyPassword } from '../common/utils/password.util';
import { IJwtConfig, jwtConfig } from '../jwt.config';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../users/users.enums';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './auth.types';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly citiesService: CitiesService,
    private readonly categoriesService: CategoriesService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    @Inject(appConfig.KEY) private readonly appCfg: IConfig,
    @Inject(jwtConfig.KEY)
    private readonly jwt: IJwtConfig,
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
      secret: this.jwt.refreshSecret,
      expiresIn: this.jwt.refreshExpiresIn as StringValue,
    });

    await this.usersRepository.update(user.id, {
      refreshToken: hashToken(refreshToken, this.appCfg.hashSalt),
    });

    const accessMaxAgeMs = this.parseExpiresInToMs(this.jwt.accessExpiresIn);
    const refreshMaxAgeMs = this.parseExpiresInToMs(this.jwt.refreshExpiresIn);

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

  async logout(userId: string, res: Response) {
    await this.usersRepository.update(userId, { refreshToken: null });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Успешный выход' };
  }

  create(createAuthDto: CreateAuthDto) {
    void createAuthDto;
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    void updateAuthDto;
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const city = await this.citiesService.findByName(dto.city);
    if (!city) {
      throw new BadRequestException('Неизвестный город');
    }

    const wantToLearn = await this.categoriesService.assertSubcategory(
      dto.wantToLearn.categoryId,
      dto.wantToLearn.subcategoryId,
    );
    const skillCategory = await this.categoriesService.assertSubcategory(
      dto.skill.categoryId,
      dto.skill.subcategoryId,
    );

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const userId = await this.dataSource.transaction(async (manager) => {
        const user = manager.create(User, {
          name: dto.name,
          email,
          password: passwordHash,
          about: null,
          birthdate: dto.birthdate,
          city: city.name,
          gender: dto.gender,
          avatar: '',
          role: Roles.USER,
          refreshToken: null,
        });
        const savedUser = await manager.save(user);
        await manager
          .createQueryBuilder()
          .relation(User, 'wantToLearn')
          .of(savedUser)
          .add(wantToLearn);

        const skill = manager.create(Skill, {
          title: dto.skill.title,
          description: dto.skill.description,
          images: dto.skill.images ?? [],
          category: skillCategory,
          owner: savedUser,
        });
        await manager.save(skill);

        return savedUser.id;
      });

      const tokens = await this.issueTokens(userId, email, Roles.USER);
      const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersService.updateRefreshToken(userId, refreshTokenHash);

      const user = await this.usersService.findPublicById(userId);
      return {
        user: this.toPublicUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw error;
    }
  }

  private async issueTokens(userId: string, email: string, role: Roles) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwt.accessSecret,
        expiresIn: this.jwt.accessExpiresIn as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwt.refreshSecret,
        expiresIn: this.jwt.refreshExpiresIn as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: User | null) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      about: user.about,
      birthdate: user.birthdate,
      city: user.city,
      gender: user.gender,
      avatar: user.avatar,
      role: user.role,
      skills: user.skills,
      wantToLearn: user.wantToLearn,
      favoriteSkills: user.favoriteSkills,
    };
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
