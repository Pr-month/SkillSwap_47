import { Repository } from 'typeorm';
import { CITIES_SEED } from './cities.data';
import { seedCities } from './cities.seed';
import { City } from './entities/city.entity';

describe('seedCities', () => {
  let find: jest.Mock;
  let insert: jest.Mock;
  let repository: Repository<City>;

  beforeEach(() => {
    find = jest.fn();
    insert = jest.fn();
    repository = { find, insert } as unknown as Repository<City>;
  });

  it('should contain unique city names from the source dataset', () => {
    expect(CITIES_SEED).toHaveLength(1111);
    expect(new Set(CITIES_SEED).size).toBe(CITIES_SEED.length);
  });

  it('should insert only missing cities', async () => {
    find.mockResolvedValue([{ name: 'Москва' }]);
    insert.mockResolvedValue({});
    const missingCities = CITIES_SEED.filter((name) => name !== 'Москва').map(
      (name) => ({ name }),
    );

    await expect(seedCities(repository)).resolves.toBe(missingCities.length);
    expect(find).toHaveBeenCalledWith({ select: { name: true } });
    expect(insert).toHaveBeenCalledWith(missingCities);
  });

  it('should not insert anything when all cities already exist', async () => {
    find.mockResolvedValue(CITIES_SEED.map((name) => ({ name })));

    await expect(seedCities(repository)).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });
});
