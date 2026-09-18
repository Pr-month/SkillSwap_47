import { ApiProperty } from '@nestjs/swagger';

export class CategoryTreeChildDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Гитара' })
  name!: string;
}

export class CategoryTreeDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Музыка' })
  name!: string;

  @ApiProperty({ type: [CategoryTreeChildDto] })
  children!: CategoryTreeChildDto[];
}
