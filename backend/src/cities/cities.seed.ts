import { Repository } from 'typeorm';
import { CITIES_SEED } from './cities.data';
import { City } from './entities/city.entity';

export async function seedCities(
  citiesRepository: Repository<City>,
): Promise<number> {
  const existingCities = await citiesRepository.find({
    select: { name: true },
  });
  const existingNames = new Set(existingCities.map(({ name }) => name));
  const missingCities = CITIES_SEED.filter(
    (name) => !existingNames.has(name),
  ).map((name) => ({ name }));

  if (missingCities.length === 0) {
    return 0;
  }

  await citiesRepository.insert(missingCities);
  return missingCities.length;
}
