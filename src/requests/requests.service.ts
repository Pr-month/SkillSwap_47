import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { JwtPayload } from '../auth/auth.types';
import { Roles } from '../common/enums/user-role.enum';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  create(createRequestDto: CreateRequestDto) {
    console.log(createRequestDto);
    return `This action creates a new requests`;
  }

  findAll() {
    return `This action returns all requests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    console.log(updateRequestDto);
    return `This action updates a #${id} request`;
  }

  async remove(requestId: string, user: JwtPayload) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: { sender: true },
    });

    if (!request) {
      throw new NotFoundException('Запрос не найден');
    }

    const isAdmin = user.role === Roles.ADMIN;
    const isOwner = request.sender.id === user.sub;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('У вас нет прав на удаление этой заявки');
    }

    await this.requestsRepository.remove(request);

    return { message: `Заявка с ID ${requestId} успешно удалена` };
  }
}
