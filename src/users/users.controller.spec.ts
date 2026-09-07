import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/enums/user-role.enum';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let findAll: jest.Mock;
  let remove: jest.Mock;

  beforeEach(async () => {
    findAll = jest.fn();
    remove = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll,
            findOne: jest.fn(),
            findMe: jest.fn(),
            updateMe: jest.fn(),
            updatePassword: jest.fn(),
            update: jest.fn(),
            remove,
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const users = [{ id: 'user-id', name: 'Анна' }];
    findAll.mockResolvedValue(users);

    await expect(controller.findAll({})).resolves.toEqual(users);
    expect(findAll).toHaveBeenCalledTimes(1);
  });

  it('should delegate user deletion to the service', async () => {
    const userId = 'd0bd1721-bfef-41ae-a4dc-181a54627089';
    const response = { message: 'Пользователь успешно удалён' };
    remove.mockResolvedValue(response);

    await expect(controller.remove(userId)).resolves.toEqual(response);
    expect(remove).toHaveBeenCalledWith(userId);
  });

  it('should protect user deletion with JWT and admin role', () => {
    // Metadata is stored on the handler function; it is not invoked unbound.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const removeHandler = UsersController.prototype.remove;
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      removeHandler,
    ) as unknown[];
    const roles = Reflect.getMetadata(ROLES_KEY, removeHandler) as Roles[];

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([Roles.ADMIN]);
  });
});
