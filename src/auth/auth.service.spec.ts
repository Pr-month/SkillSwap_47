import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryFailedError } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../cities/cities.service';
import { UserGender } from '../common/enums/user-gender.enum';
import { Roles } from '../common/enums/user-role.enum';
import { appConfig } from '../config/app.config';
import { jwtConfig } from '../config/jwt.config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshAuthUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let findOne: jest.Mock;
  let update: jest.Mock;
  let findByEmail: jest.Mock;
  let findPublicById: jest.Mock;
  let updateRefreshToken: jest.Mock;
  let findByName: jest.Mock;
  let assertSubcategory: jest.Mock;
  let signAsync: jest.Mock;
  let transaction: jest.Mock;

  const bcryptCompare = bcrypt.compare as jest.Mock;
  const bcryptHash = bcrypt.hash as jest.Mock;

  const storedUser = {
    id: 'user-1',
    email: 'alex@mail.com',
    password: 'hashed-password',
    name: 'Алексей',
    role: Roles.USER,
    refreshToken: 'hashed-refresh',
  };

  const registerDto: RegisterDto = {
    email: 'Alex@Mail.com',
    password: 'password1',
    name: 'Алексей',
    birthdate: '1998-04-12',
    gender: UserGender.MALE,
    city: 'Санкт-Петербург',
    wantToLearn: { categoryId: 'cat-1', subcategoryId: 'sub-1' },
    skill: {
      title: 'Гитара',
      categoryId: 'cat-2',
      subcategoryId: 'sub-2',
      description: 'Уроки игры',
      images: ['img.png'],
    },
  };

  const publicUser = {
    id: 'user-1',
    name: 'Алексей',
    email: 'alex@mail.com',
    about: null,
    birthdate: '1998-04-12',
    city: 'Санкт-Петербург',
    gender: UserGender.MALE,
    avatar: '',
    role: Roles.USER,
    skills: [],
    wantToLearn: [],
    favoriteSkills: [],
  };

  beforeEach(async () => {
    findOne = jest.fn();
    update = jest.fn();
    findByEmail = jest.fn();
    findPublicById = jest.fn();
    updateRefreshToken = jest.fn();
    findByName = jest.fn();
    assertSubcategory = jest.fn();
    signAsync = jest.fn(async (_payload, options: { secret: string }) =>
      options.secret === 'access' ? 'access-token' : 'refresh-token',
    );
    transaction = jest.fn();
    bcryptCompare.mockReset();
    bcryptHash.mockReset();
    bcryptHash.mockResolvedValue('hashed-value');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByEmail, findPublicById, updateRefreshToken },
        },
        { provide: CitiesService, useValue: { findByName } },
        { provide: CategoriesService, useValue: { assertSubcategory } },
        { provide: DataSource, useValue: { transaction } },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne, update },
        },
        { provide: JwtService, useValue: { signAsync } },
        { provide: appConfig.KEY, useValue: { saltRounds: 10 } },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessSecret: 'access',
            refreshSecret: 'refresh',
            accessExpiresIn: '1h',
            refreshExpiresIn: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login returns tokens and user when credentials are valid', async () => {
    findOne.mockResolvedValue(storedUser);
    bcryptCompare.mockResolvedValue(true);

    const result = await service.login({
      email: 'Alex@Mail.com',
      password: 'password1',
    });

    expect(findOne).toHaveBeenCalledWith({
      where: { email: 'alex@mail.com' },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });
    expect(update).toHaveBeenCalledWith('user-1', {
      refreshToken: 'hashed-value',
    });
    expect(result).toEqual({
      message: 'Успешный вход',
      user: {
        id: 'user-1',
        email: 'alex@mail.com',
        name: 'Алексей',
        role: Roles.USER,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('login throws when user is missing', async () => {
    findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@mail.com', password: 'password1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(update).not.toHaveBeenCalled();
  });

  it('login throws when password is invalid', async () => {
    findOne.mockResolvedValue(storedUser);
    bcryptCompare.mockResolvedValue(false);

    await expect(
      service.login({ email: 'alex@mail.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(update).not.toHaveBeenCalled();
  });

  it('refresh rotates tokens when stored hash matches', async () => {
    findOne.mockResolvedValue(storedUser);
    bcryptCompare.mockResolvedValue(true);

    const authUser: RefreshAuthUser = {
      sub: 'user-1',
      email: 'alex@mail.com',
      role: Roles.USER,
      refreshToken: 'refresh-token',
    };

    await expect(service.refresh(authUser)).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(update).toHaveBeenCalledWith('user-1', {
      refreshToken: 'hashed-value',
    });
  });

  it('refresh throws when stored refresh token is missing', async () => {
    findOne.mockResolvedValue({ ...storedUser, refreshToken: null });

    await expect(
      service.refresh({
        sub: 'user-1',
        email: 'alex@mail.com',
        role: Roles.USER,
        refreshToken: 'refresh-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh throws when request refresh token is missing', async () => {
    findOne.mockResolvedValue(storedUser);

    await expect(
      service.refresh({
        sub: 'user-1',
        email: 'alex@mail.com',
        role: Roles.USER,
        refreshToken: '',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh throws when refresh token does not match', async () => {
    findOne.mockResolvedValue(storedUser);
    bcryptCompare.mockResolvedValue(false);

    await expect(
      service.refresh({
        sub: 'user-1',
        email: 'alex@mail.com',
        role: Roles.USER,
        refreshToken: 'other-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(update).not.toHaveBeenCalled();
  });

  it('logout clears refresh token', async () => {
    await expect(service.logout('user-1')).resolves.toEqual({
      message: 'Успешный выход',
    });
    expect(update).toHaveBeenCalledWith('user-1', { refreshToken: null });
  });

  it('register creates user, skill and returns public profile with tokens', async () => {
    findByEmail.mockResolvedValue(null);
    findByName.mockResolvedValue({ name: 'Санкт-Петербург' });
    assertSubcategory
      .mockResolvedValueOnce({ id: 'sub-1' })
      .mockResolvedValueOnce({ id: 'sub-2' });
    findPublicById.mockResolvedValue(publicUser);

    const add = jest.fn().mockResolvedValue(undefined);
    const manager = {
      create: jest.fn((_entity: unknown, data: object) => ({ ...data })),
      save: jest.fn(async (entity: { id?: string }) => ({
        ...entity,
        id: entity.id ?? 'user-1',
      })),
      createQueryBuilder: jest.fn(() => ({
        relation: jest.fn().mockReturnThis(),
        of: jest.fn().mockReturnThis(),
        add,
      })),
    };
    transaction.mockImplementation(async (cb: (mgr: typeof manager) => unknown) =>
      cb(manager),
    );

    const result = await service.register(registerDto);

    expect(findByEmail).toHaveBeenCalledWith('alex@mail.com');
    expect(assertSubcategory).toHaveBeenNthCalledWith(1, 'cat-1', 'sub-1');
    expect(assertSubcategory).toHaveBeenNthCalledWith(2, 'cat-2', 'sub-2');
    expect(updateRefreshToken).toHaveBeenCalledWith('user-1', 'hashed-value');
    expect(result).toEqual({
      user: {
        id: 'user-1',
        name: 'Алексей',
        email: 'alex@mail.com',
        about: null,
        birthdate: '1998-04-12',
        city: 'Санкт-Петербург',
        gender: UserGender.MALE,
        avatar: '',
        role: Roles.USER,
        skills: [],
        wantToLearn: [],
        favoriteSkills: [],
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('register returns null user when public profile is missing', async () => {
    findByEmail.mockResolvedValue(null);
    findByName.mockResolvedValue({ name: 'Санкт-Петербург' });
    assertSubcategory.mockResolvedValue({ id: 'sub-1' });
    findPublicById.mockResolvedValue(null);
    transaction.mockImplementation(
      async (cb: (mgr: { create: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock }) => unknown) =>
        cb({
          create: jest.fn((_entity: unknown, data: object) => ({ ...data })),
          save: jest.fn(async (entity: { id?: string }) => ({
            ...entity,
            id: entity.id ?? 'user-1',
          })),
          createQueryBuilder: jest.fn(() => ({
            relation: jest.fn().mockReturnThis(),
            of: jest.fn().mockReturnThis(),
            add: jest.fn(),
          })),
        }),
    );

    await expect(service.register(registerDto)).resolves.toMatchObject({
      user: null,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('register throws when email is already taken', async () => {
    findByEmail.mockResolvedValue(storedUser);

    await expect(service.register(registerDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(transaction).not.toHaveBeenCalled();
  });

  it('register throws when city is unknown', async () => {
    findByEmail.mockResolvedValue(null);
    findByName.mockResolvedValue(null);

    await expect(service.register(registerDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('register maps unique email constraint to ConflictException', async () => {
    findByEmail.mockResolvedValue(null);
    findByName.mockResolvedValue({ name: 'Санкт-Петербург' });
    assertSubcategory.mockResolvedValue({ id: 'sub-1' });
    const driverError = Object.assign(new Error('duplicate key'), {
      code: '23505',
    });
    transaction.mockRejectedValue(
      new QueryFailedError('INSERT', [], driverError),
    );

    await expect(service.register(registerDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('register rethrows unexpected transaction errors', async () => {
    findByEmail.mockResolvedValue(null);
    findByName.mockResolvedValue({ name: 'Санкт-Петербург' });
    assertSubcategory.mockResolvedValue({ id: 'sub-1' });
    transaction.mockRejectedValue(new Error('db down'));

    await expect(service.register(registerDto)).rejects.toThrow('db down');
  });
});
