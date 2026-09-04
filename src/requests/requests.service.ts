import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestStatus } from '../common/enums/request-status.enum';
import { SkillsService } from '../skills/skills.service';
import { User } from '../users/entities/user.entity';
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
      throw new ForbiddenException(
        'Предложить можно только свой навык',
      );
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
      sender: { id: senderId } as User,
      receiver: { id: requestedSkill.owner.id } as User,
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

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    void updateRequestDto;
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
