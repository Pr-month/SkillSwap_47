import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { Request } from './entities/request.entity';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  create(createRequestDto: CreateRequestDto) {
    void createRequestDto;
    return 'This action adds a new request';
  }

  findAll() {
    return `This action returns all requests`;
  }

  async findIncoming(userId: string): Promise<Request[]> {
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

  update(id: number, updateRequestDto: UpdateRequestDto) {
    void updateRequestDto;
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
