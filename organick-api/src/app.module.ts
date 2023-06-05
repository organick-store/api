import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { EmailService } from './services/email.service';

import * as dotenv from 'dotenv';
import { TemporaryPassword } from './entities/temporaryPasswords.entity';
import { Product } from './entities/product.entity';
import { ProductService } from './services/product.service';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: true,
      entities: [User, TemporaryPassword, Product]
    }), 
    TypeOrmModule.forFeature([User, TemporaryPassword, Product]),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        secure: false,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [UserService, EmailService, ProductService]
})
export class AppModule {}
