import { DataSource } from 'typeorm';
import { databaseConfig } from './db.config'; // Импортируем конфиг

export const AppDataSource = new DataSource(databaseConfig());
