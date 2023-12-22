import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  ssl: true,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  entities: ['dist/src/**/*.entity.{ts,js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
});

