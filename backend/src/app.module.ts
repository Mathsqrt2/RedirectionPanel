import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RedirectionsModule } from './redirections/redirections.module';
import { CodeModule } from './code/code.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    CodeModule,
    UserModule,
    DatabaseModule,
    RedirectionsModule,
  ]
})

export class AppModule { }
