import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestStatus } from '../common/enums/request-status.enum';
import { SkillsService } from '../skills/skills.service';
import { SkillRequest } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let findById: jest.Mock;
  let findOne: jest.Mock;
  let create: jest.Mock;
  let save: jest.Mock;

  beforeEach(async () => {
    findById = jest.fn();
    findOne = jest.fn();
    create = jest.fn((payload: Partial<SkillRequest>) => payload as SkillRequest);
    save = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(SkillRequest),
          useValue: { findOne, create, save },
        },
        {
          provide: SkillsService,
          useValue: { findById },
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create assigns sender from user and receiver from requested skill owner', async () => {
    const offeredSkill = {
      id: 'offered-1',
      owner: { id: 'sender-1' },
    };
    const requestedSkill = {
      id: 'requested-1',
      owner: { id: 'receiver-1' },
    };
    const saved = { id: 'request-1' };

    findById.mockResolvedValueOnce(offeredSkill).mockResolvedValueOnce(
      requestedSkill,
    );
    findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(saved);
    save.mockResolvedValue(saved);

    const result = await service.create('sender-1', {
      offeredSkillId: 'offered-1',
      requestedSkillId: 'requested-1',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: { id: 'sender-1' },
        receiver: { id: 'receiver-1' },
        status: RequestStatus.PENDING,
        isRead: false,
      }),
    );
    expect(result).toEqual(saved);
  });

  it('create rejects offering a skill that belongs to another user', async () => {
    findById
      .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'other' } })
      .mockResolvedValueOnce({ id: 'requested-1', owner: { id: 'receiver-1' } });

    await expect(
      service.create('sender-1', {
        offeredSkillId: 'offered-1',
        requestedSkillId: 'requested-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('create rejects requesting own skill', async () => {
    findById
      .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'sender-1' } })
      .mockResolvedValueOnce({ id: 'requested-1', owner: { id: 'sender-1' } });

    await expect(
      service.create('sender-1', {
        offeredSkillId: 'offered-1',
        requestedSkillId: 'requested-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
