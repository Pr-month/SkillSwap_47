import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CITIES_SEED } from './cities.data';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService implements OnModuleInit {
  private readonly logger = new Logger(CitiesService.name);

  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.citiesRepository.count();
      if (count > 0) {
        return;
      }

      await this.citiesRepository.save(
        CITIES_SEED.map((name) => this.citiesRepository.create({ name })),
      );
    } catch (error) {
      this.logger.warn(
        `Сид городов пропущен: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

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
