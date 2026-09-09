import { AppDataSource } from 'src/config/ormconfig';

async function clearDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.synchronize(true);
}

clearDb()
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });