import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSqlite = config.get<string>('DATABASE_USE_SQLITE') === 'true';
        if (useSqlite) {
          const dataDir = join(process.cwd(), 'data');
          if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
          return {
            type: 'sqljs' as const,
            autoSave: true,
            location: join(dataDir, 'dev.sqlite'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }
        return {
          type: 'postgres' as const,
          host: config.get<string>('DATABASE_HOST'),
          port: config.get<number>('DATABASE_PORT', 5432),
          username: config.get<string>('DATABASE_USER'),
          password: config.get<string>('DATABASE_PASSWORD'),
          database: config.get<string>('DATABASE_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    ReviewsModule,
  ],
})
export class AppModule {}