import { AppDataSource } from 'src/config/ormconfig';

async function clearDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.query('DROP SCHEMA public CASCADE');
  await AppDataSource.query('CREATE SCHEMA public');
  await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await AppDataSource.runMigrations();
}

void clearDb().finally(() => {
  if (AppDataSource.isInitialized) {
    void AppDataSource.destroy();
  }
});
