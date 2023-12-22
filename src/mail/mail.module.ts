import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { UserModule } from 'src/user/user.module';
import { ParserService } from './services/parser.service';

@Module({
  imports: [UserModule],
  exports: [MailService],
  providers: [MailService, ParserService]
})
export class MailModule {}
