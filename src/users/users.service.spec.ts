import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../cities/cities.service';
import { Roles } from '../common/enums/user-role.enum';
import { appConfig } from '../config/app.config';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let findOne: jest.Mock;
  let update: jest.Mock;
  let save: jest.Mock;
  let findByName: jest.Mock;
  let usersRepository: { find: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    findOne = jest.fn();
    update = jest.fn();
    save = jest.fn();
    findByName = jest.fn();
    usersRepository = { find: jest.fn(), update };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            ...usersRepository,
            findOne,
            save,
            update,
          },
        },
        {
          provide: appConfig.KEY,
          useValue: { saltRounds: 10 },
        },
        {
          provide: CitiesService,
          useValue: { findByName },
        },
        {
          provide: CategoriesService,
          useValue: { assertSubcategory: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findMe returns user without password and refreshToken', async () => {
    findOne.mockResolvedValue({
      id: 'user-1',
      name: 'Алексей',
      email: 'alex@mail.com',
      about: null,
      birthdate: '1998-04-12',
      city: 'Москва',
      gender: 'male',
      avatar: '',
      role: Roles.USER,
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      password: 'hash',
      refreshToken: 'secret',
    });

    const result = await service.findMe('user-1');

    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('refreshToken');
    expect(result).toMatchObject({
      id: 'user-1',
      email: 'alex@mail.com',
      name: 'Алексей',
    });
  });

  it('findMe throws if user is missing', async () => {
    findOne.mockResolvedValue(null);
    await expect(service.findMe('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should return users with their public relations', async () => {
    const users = [{ id: 'user-id', name: 'Анна' } as User];
    usersRepository.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toEqual(users);
    expect(usersRepository.find).toHaveBeenCalledWith({
      relations: {
        skills: { category: true },
        wantToLearn: true,
      },
      order: { name: 'ASC' },
    });
  });

  it('updatePassword changes the password after verifying the current one', async () => {
    const passwordHash = await bcrypt.hash('old-password', 10);
    findOne.mockResolvedValue({ id: 'user-1', password: passwordHash });

    await expect(
      service.updatePassword('user-1', {
        oldPassword: 'old-password',
        newPassword: 'new-password',
      }),
    ).resolves.toMatchObject({ message: 'Пароль успешно обновлён' });

    expect(update).toHaveBeenCalledTimes(1);
    const updatePayload: { password: string } = {
      password: expect.any(String) as string,
    };
    expect(update).toHaveBeenCalledWith({ id: 'user-1' }, updatePayload);
  });

  it('updatePassword throws when the current password is incorrect', async () => {
    findOne.mockResolvedValue({
      id: 'user-1',
      password: await bcrypt.hash('old-password', 10),
    });

    await expect(
      service.updatePassword('user-1', {
        oldPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('updateMe updates profile fields without secrets', async () => {
    const current = {
      id: 'user-1',
      name: 'Алексей',
      email: 'alex@mail.com',
      about: null,
      birthdate: '1998-04-12',
      city: 'Москва',
      gender: 'male',
      avatar: '',
      role: Roles.USER,
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      password: 'hash',
      refreshToken: 'secret',
    };
    findOne.mockResolvedValue(current);
    findByName.mockResolvedValue({ name: 'Казань' });
    save.mockImplementation((user: User) => user);

    const result = await service.updateMe('user-1', {
      name: 'Иван',
      city: 'Казань',
      about: 'Привет',
    });

    expect(save).toHaveBeenCalled();
    expect(result).toMatchObject({
      name: 'Иван',
      city: 'Казань',
      about: 'Привет',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('refreshToken');
  });

  it('updateMe rejects an unknown city', async () => {
    findOne.mockResolvedValue({
      id: 'user-1',
      email: 'alex@mail.com',
      wantToLearn: [],
    });
    findByName.mockResolvedValue(null);

    await expect(
      service.updateMe('user-1', { city: 'Неттакого' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateMe rejects a taken email', async () => {
    findOne
      .mockResolvedValueOnce({
        id: 'user-1',
        email: 'old@mail.com',
        wantToLearn: [],
      })
      .mockResolvedValueOnce({ id: 'user-2', email: 'taken@mail.com' });

    await expect(
      service.updateMe('user-1', { email: 'taken@mail.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updateMe throws if user is missing', async () => {
    findOne.mockResolvedValue(null);
    await expect(
      service.updateMe('missing', { name: 'Иван' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
