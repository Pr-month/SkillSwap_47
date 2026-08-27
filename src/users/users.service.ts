import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    void createUserDto;
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    void updateUserDto;
    return `This action updates a #${id} user`;
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
