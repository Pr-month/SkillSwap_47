import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestStatus } from '../common/enums/request-status.enum';
import { Roles } from '../common/enums/user-role.enum';
import { SkillsService } from '../skills/skills.service';
import { SkillRequest } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let findById: jest.Mock;
  let findOne: jest.Mock;
  let find: jest.Mock;
  let create: jest.Mock;
  let save: jest.Mock;
  let remove: jest.Mock;

  beforeEach(async () => {
    findById = jest.fn();
    findOne = jest.fn();
    find = jest.fn();
    create = jest.fn(
      (payload: Partial<SkillRequest>) => payload as SkillRequest,
    );
    save = jest.fn();
    remove = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(SkillRequest),
          useValue: { findOne, find, create, save, remove },
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

  describe('create', () => {
    it('assigns sender from user and receiver from requested skill owner', async () => {
      const offeredSkill = {
        id: 'offered-1',
        owner: { id: 'sender-1' },
      };
      const requestedSkill = {
        id: 'requested-1',
        owner: { id: 'receiver-1' },
      };
      const saved = { id: 'request-1' };

      findById
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);
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

    it('rejects when offered and requested skills are the same', async () => {
      await expect(
        service.create('sender-1', {
          offeredSkillId: 'skill-1',
          requestedSkillId: 'skill-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(findById).not.toHaveBeenCalled();
    });

    it('rejects offering a skill that belongs to another user', async () => {
      findById
        .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'other' } })
        .mockResolvedValueOnce({
          id: 'requested-1',
          owner: { id: 'receiver-1' },
        });

      await expect(
        service.create('sender-1', {
          offeredSkillId: 'offered-1',
          requestedSkillId: 'requested-1',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects requesting own skill', async () => {
      findById
        .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'sender-1' } })
        .mockResolvedValueOnce({
          id: 'requested-1',
          owner: { id: 'sender-1' },
        });

      await expect(
        service.create('sender-1', {
          offeredSkillId: 'offered-1',
          requestedSkillId: 'requested-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when a pending request already exists', async () => {
      findById
        .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'sender-1' } })
        .mockResolvedValueOnce({
          id: 'requested-1',
          owner: { id: 'receiver-1' },
        });
      findOne.mockResolvedValue({ id: 'existing-1' });

      await expect(
        service.create('sender-1', {
          offeredSkillId: 'offered-1',
          requestedSkillId: 'requested-1',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it.each(Object.values(RequestStatus))(
      'sets status %s and marks incoming request as read',
      async (status) => {
        const request = {
          id: 'req-1',
          status: RequestStatus.PENDING,
          isRead: false,
          receiver: { id: 'receiver-1' },
          sender: { id: 'sender-1' },
        };
        findOne.mockResolvedValue(request);
        save.mockImplementation((entity: SkillRequest) => entity);

        const result = await service.update('req-1', 'receiver-1', { status });

        expect(save).toHaveBeenCalledWith(
          expect.objectContaining({
            status,
            isRead: true,
          }),
        );
        expect(result.status).toBe(status);
        expect(result.isRead).toBe(true);
      },
    );

    it('rejects when request is not found', async () => {
      findOne.mockResolvedValue(null);

      await expect(
        service.update('missing', 'receiver-1', {
          status: RequestStatus.ACCEPTED,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when user is not the receiver', async () => {
      findOne.mockResolvedValue({
        id: 'req-1',
        status: RequestStatus.PENDING,
        isRead: false,
        receiver: { id: 'receiver-1' },
      });

      await expect(
        service.update('req-1', 'sender-1', {
          status: RequestStatus.ACCEPTED,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe('findIncoming', () => {
    it('returns requests received by the user with newest first', async () => {
      const requests = [{ id: 'req-1' }];
      find.mockResolvedValue(requests);

      const result = await service.findIncoming('receiver-1');

      expect(find).toHaveBeenCalledWith({
        where: { receiver: { id: 'receiver-1' } },
        relations: {
          sender: true,
          offeredSkill: { category: true },
          requestedSkill: { category: true },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(requests);
    });
  });

  describe('findOutgoing', () => {
    it('returns requests sent by the user with newest first', async () => {
      const requests = [{ id: 'req-1' }];
      find.mockResolvedValue(requests);

      const result = await service.findOutgoing('sender-1');

      expect(find).toHaveBeenCalledWith({
        where: { sender: { id: 'sender-1' } },
        relations: {
          receiver: true,
          offeredSkill: { category: true },
          requestedSkill: { category: true },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(requests);
    });
  });

  describe('remove', () => {
    it('allows the sender to delete their request', async () => {
      const request = {
        id: 'req-1',
        sender: { id: 'sender-1' },
      } as SkillRequest;
      findOne.mockResolvedValue(request);
      remove.mockResolvedValue(request);

      await expect(
        service.remove('req-1', {
          sub: 'sender-1',
          role: Roles.USER,
        } as never),
      ).resolves.toEqual({
        message: 'Заявка с ID req-1 успешно удалена',
      });
      expect(remove).toHaveBeenCalledWith(request);
    });

    it('allows an admin to delete any request', async () => {
      const request = {
        id: 'req-1',
        sender: { id: 'sender-1' },
      } as SkillRequest;
      findOne.mockResolvedValue(request);
      remove.mockResolvedValue(request);

      await expect(
        service.remove('req-1', {
          sub: 'admin-1',
          role: Roles.ADMIN,
        } as never),
      ).resolves.toEqual({
        message: 'Заявка с ID req-1 успешно удалена',
      });
      expect(remove).toHaveBeenCalledWith(request);
    });

    it('rejects when request is not found', async () => {
      findOne.mockResolvedValue(null);

      await expect(
        service.remove('missing', {
          sub: 'sender-1',
          role: Roles.USER,
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when user is neither sender nor admin', async () => {
      findOne.mockResolvedValue({
        id: 'req-1',
        sender: { id: 'sender-1' },
      });

      await expect(
        service.remove('req-1', {
          sub: 'other-user',
          role: Roles.USER,
        } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe('stubs', () => {
    it('findAll returns placeholder string', () => {
      expect(service.findAll()).toBe('This action returns all requests');
    });

    it('findOne returns placeholder string', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 request');
    });
  });
});
