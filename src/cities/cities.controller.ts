import { Controller, Get } from '@nestjs/common';
import { ApiCitiesTag, ApiFindCities } from './cities.swagger';
import { CitiesService } from './cities.service';

@ApiCitiesTag()
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiFindCities()
  findAll() {
    return this.citiesService.findAll();
  }
}
