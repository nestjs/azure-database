if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });
  await app.listen(3000);
}
bootstrap();
