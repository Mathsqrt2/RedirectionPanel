import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const port = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(port, ()=> {
    console.log(`Server is currently running on port ${port}. Relaunch date: ${new Date()}`)
  });
}
bootstrap();
