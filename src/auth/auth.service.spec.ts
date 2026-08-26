import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { appConfig } from '../app.config';
import { jwtConfig } from '../jwt.config';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
            hashSalt: 'test_salt',
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
