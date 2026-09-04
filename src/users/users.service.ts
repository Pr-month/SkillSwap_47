import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../cities/cities.service';
import { appConfig, IConfig } from '../config/app.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly appCfg: IConfig,
    private readonly citiesService: CitiesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  create(createUserDto: CreateUserDto) {
    void createUserDto;
    return 'This action adds a new user';
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: {
        skills: { category: true },
        wantToLearn: true,
      },
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const passwordValid = await bcrypt.compare(dto.oldPassword, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    const password = await bcrypt.hash(dto.newPassword, this.appCfg.saltRounds);
    await this.usersRepository.update({ id: userId }, { password });

    return { message: 'Пароль успешно обновлён' };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  findPublicById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: {
        skills: { category: true },
        wantToLearn: true,
        favoriteSkills: true,
      },
    });
  }

  async findMe(id: string) {
    const user = await this.findPublicById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.toPublicUser(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { wantToLearn: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.about !== undefined) {
      user.about = dto.about;
    }

    if (dto.birthdate !== undefined) {
      user.birthdate = dto.birthdate;
    }

    if (dto.gender !== undefined) {
      user.gender = dto.gender;
    }

    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar;
    }

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase();
      if (email !== user.email) {
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
          throw new ConflictException(
            'Пользователь с таким email уже существует',
          );
        }
      }
      user.email = email;
    }

    if (dto.city !== undefined) {
      const city = await this.citiesService.findByName(dto.city);
      if (!city) {
        throw new BadRequestException('Неизвестный город');
      }
      user.city = city.name;
    }

    if (dto.wantToLearn) {
      user.wantToLearn = [
        await this.categoriesService.assertSubcategory(
          dto.wantToLearn.categoryId,
          dto.wantToLearn.subcategoryId,
        ),
      ];
    }

    await this.usersRepository.save(user);
    return this.findMe(userId);
  }

  private toPublicUser(user: User) {
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

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.usersRepository.update({ id }, { refreshToken });
  }
}
