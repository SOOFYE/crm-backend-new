import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Load environment variables from .env file if they haven't been loaded already
dotenv.config();

// Create an instance of ConfigService to access environment variables
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST').toString(),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity.ts'],  // Match .js files in dist/
  migrations: [__dirname + '/migrations/*.ts'],  // For migrations in dist/migrations
  synchronize: false,
  logging: true,
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/database/migrations',
  },
  ssl: configService.get<boolean>('DATABASE_SSL', false) // Enable SSL if needed
  ? { rejectUnauthorized: false } // Optional for RDS SSL connections
  : false,
} as DataSourceOptions);