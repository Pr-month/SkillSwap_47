import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '@supabase/supabase-js';
import { RequestStatus } from 'src/common/enums/request-status.enum';
import { Roles } from 'src/common/enums/user-role.enum';
import { SkillsService } from 'src/skills/skills.service';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { SkillRequest } from './entities/request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SkillRequest)
    private readonly requestsRepository: Repository<SkillRequest>,
    private readonly skillsService: SkillsService,
  ) {}

  async create(senderId: string, dto: CreateRequestDto) {
    if (dto.offeredSkillId === dto.requestedSkillId) {
      throw new BadRequestException(
        'Предлагаемый и запрашиваемый навыки должны отличаться',
      );
    }

    const [offeredSkill, requestedSkill] = await Promise.all([
      this.skillsService.findById(dto.offeredSkillId),
      this.skillsService.findById(dto.requestedSkillId),
    ]);

    if (offeredSkill.owner.id !== senderId) {
      throw new ForbiddenException('Предложить можно только свой навык');
    }

    if (requestedSkill.owner.id === senderId) {
      throw new BadRequestException(
        'Нельзя отправить заявку на собственный навык',
      );
    }

    const existing = await this.requestsRepository.findOne({
      where: {
        sender: { id: senderId },
        offeredSkill: { id: offeredSkill.id },
        requestedSkill: { id: requestedSkill.id },
        status: RequestStatus.PENDING,
      },
    });

    if (existing) {
      throw new ConflictException('Такая заявка уже отправлена');
    }

    const request = this.requestsRepository.create({
      sender: { id: senderId },
      receiver: { id: requestedSkill.owner.id },
      offeredSkill,
      requestedSkill,
      status: RequestStatus.PENDING,
      isRead: false,
    });

    const saved = await this.requestsRepository.save(request);

    return this.requestsRepository.findOne({
      where: { id: saved.id },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: { category: true },
        requestedSkill: { category: true },
      },
    });
  }

  findAll() {
    return `This action returns all requests`;
  }

  async findIncoming(userId: string): Promise<SkillRequest[]> {
    return this.requestsRepository.find({
      where: { receiver: { id: userId } },
      relations: {
        sender: true,
        offeredSkill: { category: true },
        requestedSkill: { category: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  async update(id: string, userId: string, dto: UpdateRequestDto) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: { category: true },
        requestedSkill: { category: true },
      },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.receiver.id !== userId) {
      throw new ForbiddenException('Можно обновлять только входящие заявки');
    }

    request.status = dto.status;
    request.isRead = true;

    return this.requestsRepository.save(request);
  }

  async remove(requestId: string, user: JwtPayload) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: { sender: true },
    });

    if (!request) {
      throw new NotFoundException('Запрос не найден');
    }

    const isAdmin = user.role === (Roles.ADMIN as string);
    const isOwner = request.sender.id === user.sub;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('У вас нет прав на удаление этой заявки');
    }

    await this.requestsRepository.remove(request);

    return { message: `Заявка с ID ${requestId} успешно удалена` };
  }
}
