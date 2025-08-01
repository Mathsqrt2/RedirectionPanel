import { RedirectionsModule } from './redirections/redirections.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CodeModule } from './code/code.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CodeModule,
    UserModule,
    DatabaseModule,
    RedirectionsModule,
  ]
})

export class AppModule { }
