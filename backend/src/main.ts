import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Création de l'application avec NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔹 Autoriser ton frontend React à communiquer avec le backend NestJS
  app.enableCors({
    origin: 'http://localhost:5173', // URL de ton front React
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`✅ Backend running on http://localhost:${port}`);
}

bootstrap();
