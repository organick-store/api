import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { EmailOptionsData } from '../datas/email.data';
import { mailTemplate } from '../templates/mail.template';
import { AuthResponseDTO } from '../DTOs/authResponse.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(User) private readonly userReposiroty: Repository<User>
  ) {}

  async sendEmail({ to }: EmailOptionsData, tmpPassword: string): Promise<AuthResponseDTO> {
    try {
      const user = await this.userReposiroty.findOneBy({ email: to });
      if (!user) 
        return { status: 'ErrNotFound', message: `User with email: ${to} not found` };

      const newPassword = 'http://localhost:3001/' //process.env.RESET_PASSWD_URL + uniqueToken;
      const html = mailTemplate.replace('TMP_PASSWD', newPassword);

      await this.mailerService.sendMail({
        to,
        subject: 'Access recovery',
        html
      });
      return { status: 'Success', message: `Email has been sent to: ${to}` };
    } catch (error) {
      return { status: 'Error', message: error.message };
    }
  }
}
