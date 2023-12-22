import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { User } from './user/entities/user.entity';
import * as dotenv from 'dotenv';
import { TemporaryPassword } from './user/entities/temporary-password.entity';
import { Product } from './product/entities/product.entity';
import { Order } from './order/enrtities/order.entity';
import { OrderProduct } from './order/enrtities/order-product.entity';
import { join } from 'path';
import { AuthorizationModule } from './authorization/authorization.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { JwtModule } from '@nestjs/jwt';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      migrationsRun: true,
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.NODE_ENV === 'production',
      migrations: [join(__dirname, '../db/migrations/*.{ts,js}')],
      entities: [User, TemporaryPassword, Product, Order, OrderProduct]
    }),
    MailerModule.forRoot({
      transport: {
        secure: false,
        host: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      }
    }),
    AuthorizationModule,
    UserModule,
    MailModule,
    OrderModule,
    ProductModule,
    OrderModule
  ]
})
export class AppModule {}
