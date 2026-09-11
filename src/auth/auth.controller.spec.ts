import { Test, TestingModule } from '@nestjs/testing';
import { UserGender } from '../common/enums/user-gender.enum';
import { Roles } from '../common/enums/user-role.enum';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let register: jest.Mock;
  let login: jest.Mock;
  let refresh: jest.Mock;
  let logout: jest.Mock;

  beforeEach(async () => {
    register = jest.fn();
    login = jest.fn();
    refresh = jest.fn();
    logout = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { register, login, refresh, logout },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register delegates to the service', async () => {
    const dto: RegisterDto = {
      email: 'alex@mail.com',
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
        description: 'Уроки',
      },
    };
    const payload = { accessToken: 'access-token' };
    register.mockResolvedValue(payload);

    await expect(controller.register(dto)).resolves.toEqual(payload);
    expect(register).toHaveBeenCalledWith(dto);
  });

  it('login delegates to the service', async () => {
    const dto: LoginDto = { email: 'alex@mail.com', password: 'password1' };
    const payload = { message: 'Успешный вход' };
    login.mockResolvedValue(payload);

    await expect(controller.login(dto)).resolves.toEqual(payload);
    expect(login).toHaveBeenCalledWith(dto);
  });

  it('refresh passes authenticated user from the request', async () => {
    const authUser: RefreshAuthUser = {
      sub: 'user-1',
      email: 'alex@mail.com',
      role: Roles.USER,
      refreshToken: 'refresh-token',
    };
    const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
    refresh.mockResolvedValue(tokens);

    await expect(
      controller.refresh({ refreshToken: 'refresh-token' }, { user: authUser }),
    ).resolves.toEqual(tokens);
    expect(refresh).toHaveBeenCalledWith(authUser);
  });

  it('logout passes user id from the request', async () => {
    logout.mockResolvedValue({ message: 'Успешный выход' });

    await expect(
      controller.logout({ user: { sub: 'user-1' } }),
    ).resolves.toEqual({ message: 'Успешный выход' });
    expect(logout).toHaveBeenCalledWith('user-1');
  });
});
