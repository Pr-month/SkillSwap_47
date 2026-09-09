import { Test, TestingModule } from '@nestjs/testing';
import { RequestStatus } from '../common/enums/request-status.enum';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

describe('RequestsController', () => {
  let controller: RequestsController;
  let update: jest.Mock;
  let findOutgoing: jest.Mock;

  beforeEach(async () => {
    update = jest.fn();
    findOutgoing = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findIncoming: jest.fn(),
            findOutgoing,
            findOne: jest.fn(),
            update,
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('update delegates status change to the service', async () => {
    const dto = { status: RequestStatus.ACCEPTED };
    update.mockResolvedValue({ id: 'req-1', ...dto, isRead: true });

    await controller.update('req-1', 'receiver-1', dto);

    expect(update).toHaveBeenCalledWith('req-1', 'receiver-1', dto);
  });

  it('findOutgoing delegates user id to the service', async () => {
    await controller.findOutgoing('sender-1');

    expect(findOutgoing).toHaveBeenCalledWith('sender-1');
  });
});
