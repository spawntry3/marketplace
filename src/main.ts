import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — разрешаем запросы с фронтенда
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Глобальный префикс /api
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
