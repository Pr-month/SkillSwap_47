import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

describe('Сервис городов', () => {
  let service: CitiesService;
  let find: jest.Mock;
  let findOne: jest.Mock;

  beforeEach(async () => {
    find = jest.fn();
    findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: {
            find,
            findOne,
          },
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('возвращает города по алфавиту', async () => {
    const cities = [
      { id: '1', name: 'Казань' },
      { id: '2', name: 'Москва' },
    ] as City[];
    find.mockResolvedValue(cities);

    await expect(service.findAll()).resolves.toEqual(cities);
    expect(find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('ищет город по имени без учёта пробелов и регистра', async () => {
    const city = { id: '1', name: 'Москва' } as City;
    findOne.mockResolvedValue(city);

    await expect(service.findByName('  Москва  ')).resolves.toEqual(city);
    expect(findOne).toHaveBeenCalledWith({
      where: { name: ILike('Москва') },
    });
  });

  it('возвращает null если города нет', async () => {
    findOne.mockResolvedValue(null);

    await expect(service.findByName('Неттакого')).resolves.toBeNull();
  });
});
