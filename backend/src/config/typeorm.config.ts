import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

// Support DATABASE_URL for Render deployment
const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Parse DATABASE_URL for Render
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
      migrationsRun: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  // Standard configuration
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'school_db',
    entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
    migrationsRun: false,
  };
};

export const typeOrmConfig: TypeOrmModuleOptions = getDatabaseConfig();

// For TypeORM CLI - must be default export
const dataSource = new DataSource(typeOrmConfig as DataSourceOptions);
export default dataSource;
