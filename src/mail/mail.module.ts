import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { UserModule } from 'src/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ParserService } from './services/parser.service';

@Module({
  providers: [MailService, ParserService],
  exports: [MailService],
  imports: [
    UserModule,
  ]
})
export class MailModule {}
