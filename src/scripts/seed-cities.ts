import { seedCities } from '../cities/cities.seed';
import { City } from '../cities/entities/city.entity';
import { AppDataSource } from '../config/ormconfig';

async function runSeedCities(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const insertedCount = await seedCities(AppDataSource.getRepository(City));
    console.log(`Сидинг городов завершён. Добавлено: ${insertedCount}`);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeedCities().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Ошибка сидинга городов: ${message}`);
  process.exitCode = 1;
});
