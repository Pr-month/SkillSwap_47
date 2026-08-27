import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne,
            save: jest.fn(),
            update: jest.fn(),
          },
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
      role: 'user',
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
});
