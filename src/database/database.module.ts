import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederModule } from './seeder.module';

@Module({
  providers: [],
  imports: [
    SeederModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration module global
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        cli: {
          entitiesDir: 'src',
          migrationsDir: 'src/database/migrations',
          subscribersDir: 'src',
        },
        synchronize: false, // Set to false in production
        logging: true, // Optional: Enable SQL query logging
      }),
    }),
  ],
})
export class DatabaseModule {}