import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

describe('Сервис городов', () => {
  let service: CitiesService;
  let count: jest.Mock;
  let create: jest.Mock;
  let save: jest.Mock;
  let find: jest.Mock;
  let findOne: jest.Mock;

  beforeEach(async () => {
    count = jest.fn();
    create = jest.fn((payload: Partial<City>) => payload as City);
    save = jest.fn();
    find = jest.fn();
    findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: {
            count,
            create,
            save,
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

  it('не заполняет города если они уже есть', async () => {
    count.mockResolvedValue(10);

    await service.onModuleInit();

    expect(save).not.toHaveBeenCalled();
  });

  it('заполняет города если таблица пустая', async () => {
    count.mockResolvedValue(0);
    save.mockResolvedValue([]);

    await service.onModuleInit();

    expect(create).toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Москва' })]),
    );
  });

  it('игнорирует ошибки при заполнении', async () => {
    count.mockRejectedValue(new Error('db unavailable'));

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(save).not.toHaveBeenCalled();
  });
});
