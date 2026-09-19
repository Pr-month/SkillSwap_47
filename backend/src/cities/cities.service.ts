import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  findAll(): Promise<City[]> {
    return this.citiesRepository.find({
      order: { name: 'ASC' },
    });
  }

  findByName(name: string): Promise<City | null> {
    return this.citiesRepository.findOne({
      where: { name: ILike(name.trim()) },
    });
  }
}
