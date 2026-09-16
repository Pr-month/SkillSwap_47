import { AppDataSource } from 'src/config/ormconfig';

async function clearDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.synchronize(true);
}

void clearDb().finally(() => {
  if (AppDataSource.isInitialized) {
    void AppDataSource.destroy();
  }
});
