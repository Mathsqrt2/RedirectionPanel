import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from '@libs/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log])
  ],
  providers: [
    LoggerService
  ],
  exports: [
    LoggerService
  ],
})
export class LoggerModule { }
