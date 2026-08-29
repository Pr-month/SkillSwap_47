import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { appConfig } from '../config/app.config';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../cities/cities.service';
import { jwtConfig } from '../config/jwt.config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: {} },
        { provide: CitiesService, useValue: {} },
        { provide: CategoriesService, useValue: {} },
        { provide: DataSource, useValue: {} },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: appConfig.KEY,
          useValue: {
            saltRounds: 10,
          },
        },
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
});
