import { Controller, Get } from '@nestjs/common';
import { UserGender } from '../common/enums/user-gender.enum';

@Controller('genders')
export class GendersController {
  @Get()
  findAll() {
    return [
      { id: UserGender.MALE, name: 'Мужской' },
      { id: UserGender.FEMALE, name: 'Женский' },
    ];
  }
}
