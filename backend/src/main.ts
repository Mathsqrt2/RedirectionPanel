import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(config.port, () => {
    console.log(`Server is currently running on port ${config.port}. Relaunch date: ${new Date()}`)
  });

}
bootstrap();
