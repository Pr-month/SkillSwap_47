import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID запрашиваемого навыка',
  })
  @IsUUID()
  requestedSkillId!: string;

  @ApiProperty({
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    description: 'ID предлагаемого навыка',
  })
  @IsUUID()
  offeredSkillId!: string;
}
