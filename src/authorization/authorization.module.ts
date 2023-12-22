import { Module } from '@nestjs/common';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './services/authorization.service';
import { UserModule } from 'src/user/user.module';
import { EncryptionService } from './services/encryption.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationService, EncryptionService],
  imports: [
    MailModule,
    UserModule,
  ],
})
export class AuthorizationModule {}
