import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: { find: jest.Mock };

  beforeEach(async () => {
    usersRepository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            ...usersRepository,
            findOne: jest.fn(),
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
});
