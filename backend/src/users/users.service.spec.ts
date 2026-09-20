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
import { UserGender } from '../common/enums/user-gender.enum';
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
  let findAndCount: jest.Mock;
  let deleteUser: jest.Mock;
  let assertSubcategory: jest.Mock;

  const publicUser = {
    id: 'user-1',
    name: 'Алексей',
    email: 'alex@mail.com',
    about: null as string | null,
    birthdate: '1998-04-12',
    city: 'Москва',
    gender: 'male',
    avatar: '',
    role: Roles.USER,
    skills: [] as unknown[],
    wantToLearn: [] as unknown[],
    favoriteSkills: [] as unknown[],
    password: 'hash',
    refreshToken: 'secret',
  };

  beforeEach(async () => {
    findOne = jest.fn();
    update = jest.fn();
    save = jest.fn();
    findByName = jest.fn();
    findAndCount = jest.fn();
    deleteUser = jest.fn();
    assertSubcategory = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAndCount,
            findOne,
            save,
            update,
            delete: deleteUser,
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
          useValue: { assertSubcategory },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns users with their public relations', async () => {
      const users = [{ id: 'user-id', name: 'Анна' } as User];
      findAndCount.mockResolvedValue([users, 1]);

      await expect(service.findAll({})).resolves.toEqual({
        data: users,
        page: 1,
        totalPages: 1,
      });
      expect(findAndCount).toHaveBeenCalledWith({
        relations: {
          skills: { category: true },
          wantToLearn: true,
        },
        order: { name: 'ASC' },
        skip: 0,
        take: 20,
      });
    });

    it('applies custom page and limit', async () => {
      const users = [{ id: 'user-2', name: 'Борис' } as User];
      findAndCount.mockResolvedValue([users, 25]);

      await expect(service.findAll({ page: 2, limit: 10 })).resolves.toEqual({
        data: users,
        page: 2,
        totalPages: 3,
      });
      expect(findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('returns zero totalPages when there are no users', async () => {
      findAndCount.mockResolvedValue([[], 0]);

      await expect(service.findAll({})).resolves.toEqual({
        data: [],
        page: 1,
        totalPages: 0,
      });
    });

    it('throws NotFoundException when page is out of range', async () => {
      findAndCount.mockResolvedValue([[], 5]);

      await expect(
        service.findAll({ page: 3, limit: 5 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns placeholder string', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 user');
    });
  });

  describe('findByEmail', () => {
    it('looks up email in lowercase', async () => {
      const user = { id: 'user-1', email: 'alex@mail.com' } as User;
      findOne.mockResolvedValue(user);

      await expect(service.findByEmail('Alex@Mail.com')).resolves.toEqual(user);
      expect(findOne).toHaveBeenCalledWith({
        where: { email: 'alex@mail.com' },
      });
    });
  });

  describe('findPublicById', () => {
    it('loads user with public relations', async () => {
      const user = { id: 'user-1' } as User;
      findOne.mockResolvedValue(user);

      await expect(service.findPublicById('user-1')).resolves.toEqual(user);
      expect(findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: {
          skills: { category: true },
          wantToLearn: true,
          favoriteSkills: true,
        },
      });
    });
  });

  describe('findMe', () => {
    it('returns user without password and refreshToken', async () => {
      findOne.mockResolvedValue({ ...publicUser });

      const result = await service.findMe('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result).toMatchObject({
        id: 'user-1',
        email: 'alex@mail.com',
        name: 'Алексей',
      });
    });

    it('throws if user is missing', async () => {
      findOne.mockResolvedValue(null);
      await expect(service.findMe('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a user', async () => {
      const userId = 'd0bd1721-bfef-41ae-a4dc-181a54627089';
      deleteUser.mockResolvedValue({ affected: 1 });

      await expect(service.remove(userId)).resolves.toEqual({
        message: 'Пользователь успешно удалён',
      });
      expect(deleteUser).toHaveBeenCalledWith({ id: userId });
    });

    it('throws if the user to delete does not exist', async () => {
      deleteUser.mockResolvedValue({ affected: 0 });

      await expect(
        service.remove('d0bd1721-bfef-41ae-a4dc-181a54627089'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('changes the password after verifying the current one', async () => {
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

    it('throws when the current password is incorrect', async () => {
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

    it('throws when user is missing', async () => {
      findOne.mockResolvedValue(null);

      await expect(
        service.updatePassword('missing', {
          oldPassword: 'old-password',
          newPassword: 'new-password',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('updates profile fields without secrets', async () => {
      const current = { ...publicUser, wantToLearn: [] };
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

    it('updates birthdate, gender and avatar', async () => {
      const current = { ...publicUser, wantToLearn: [] };
      findOne.mockResolvedValue(current);
      save.mockImplementation((user: User) => user);

      const result = await service.updateMe('user-1', {
        birthdate: '2000-01-01',
        gender: UserGender.FEMALE,
        avatar: 'avatar.png',
      });

      expect(result).toMatchObject({
        birthdate: '2000-01-01',
        gender: UserGender.FEMALE,
        avatar: 'avatar.png',
      });
    });

    it('updates wantToLearn through assertSubcategory', async () => {
      const current = { ...publicUser, wantToLearn: [] };
      const subcategory = { id: 'sub-1', name: 'Backend' };
      findOne.mockResolvedValue(current);
      assertSubcategory.mockResolvedValue(subcategory);
      save.mockImplementation((user: User) => user);

      const result = await service.updateMe('user-1', {
        wantToLearn: {
          categoryId: 'cat-1',
          subcategoryId: 'sub-1',
        },
      });

      expect(assertSubcategory).toHaveBeenCalledWith('cat-1', 'sub-1');
      expect(result.wantToLearn).toEqual([subcategory]);
    });

    it('allows setting the same email without conflict check', async () => {
      const current = {
        ...publicUser,
        email: 'alex@mail.com',
        wantToLearn: [],
      };
      findOne.mockResolvedValue(current);
      save.mockImplementation((user: User) => user);

      await expect(
        service.updateMe('user-1', { email: 'Alex@Mail.com' }),
      ).resolves.toMatchObject({ email: 'alex@mail.com' });

      expect(findOne).toHaveBeenCalledTimes(2);
    });

    it('rejects an unknown city', async () => {
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

    it('rejects a taken email', async () => {
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

    it('throws if user is missing', async () => {
      findOne.mockResolvedValue(null);
      await expect(
        service.updateMe('missing', { name: 'Иван' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateRefreshToken', () => {
    it('updates refresh token for the user', async () => {
      update.mockResolvedValue({ affected: 1 });

      await expect(
        service.updateRefreshToken('user-1', 'new-refresh'),
      ).resolves.toBeUndefined();

      expect(update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { refreshToken: 'new-refresh' },
      );
    });
  });
});
