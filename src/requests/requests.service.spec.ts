import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestStatus } from '../common/enums/request-status.enum';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let find: jest.Mock;

  beforeEach(async () => {
    find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: { find },
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findIncoming returns requests where the user is receiver', async () => {
    const incoming = [
      {
        id: 'request-1',
        status: RequestStatus.PENDING,
        sender: { id: 'sender-1' },
        offeredSkill: { id: 'offered-1' },
        requestedSkill: { id: 'requested-1' },
      },
    ];

    find.mockResolvedValue(incoming);

    await expect(service.findIncoming('receiver-1')).resolves.toEqual(incoming);
    expect(find).toHaveBeenCalledWith({
      where: { receiver: { id: 'receiver-1' } },
      relations: {
        sender: true,
        offeredSkill: { category: true },
        requestedSkill: { category: true },
      },
      order: { createdAt: 'DESC' },
    });
  });
});
