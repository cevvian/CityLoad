import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cityload',
    entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
    synchronize: true,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});