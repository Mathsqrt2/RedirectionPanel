import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser())
  app.enableCors({
    origin: [process.env.ORIGIN1, process.env.ORIGIN2],
    credentials: true,
  });

  await app.listen(process.env.PORT, () => {
    console.log(`Server is currently running on port ${process.env.PORT}. Relaunch date: ${new Date()}`)
  });

}

bootstrap();