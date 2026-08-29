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
import type { StringValue } from 'ms';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { appConfig, IConfig } from '../config/app.config';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../cities/cities.service';
import { IJwtConfig, jwtConfig } from '../config/jwt.config';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
    @Inject(jwtConfig.KEY)
    private readonly jwt: IJwtConfig,
    @Inject(appConfig.KEY)
    private readonly appCfg: IConfig,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });

    const passwordValid =
      !!user && (await bcrypt.compare(loginDto.password, user.password));

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    const refreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      this.appCfg.saltRounds,
    );
    await this.usersRepository.update(user.id, {
      refreshToken: refreshTokenHash,
    });

    return {
      message: 'Успешный вход',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(authUser: RefreshAuthUser) {
    const storedUser = await this.usersRepository.findOne({
      where: { id: authUser.sub },
      select: {
        id: true,
        email: true,
        role: true,
        refreshToken: true,
      },
    });

    if (!storedUser?.refreshToken || !authUser.refreshToken) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    const matches = await bcrypt.compare(
      authUser.refreshToken,
      storedUser.refreshToken,
    );

    if (!matches) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    const tokens = await this.issueTokens(
      storedUser.id,
      storedUser.email,
      storedUser.role,
    );
    await this.usersRepository.update(storedUser.id, {
      refreshToken: await bcrypt.hash(
        tokens.refreshToken,
        this.appCfg.saltRounds,
      ),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { refreshToken: null });

    return { message: 'Успешный выход' };
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

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.appCfg.saltRounds,
    );

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
      const refreshTokenHash = await bcrypt.hash(
        tokens.refreshToken,
        this.appCfg.saltRounds,
      );
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
}
