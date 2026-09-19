import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RequestStatus } from '../../common/enums/request-status.enum';

export class UpdateRequestDto {
  @ApiProperty({
    example: RequestStatus.ACCEPTED,
    description: 'Новый статус заявки',
    enum: RequestStatus,
  })
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
