import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmailOptionsData } from '../datas/email.data';
import { temporaryPasswordTemplate } from '../templates/tamporaryPassword.template';
import { confirmationTemplate } from '../templates/confirmation.template';
import { AuthResponseDTO } from '../DTOs/authResponse.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(User) private readonly userReposiroty: Repository<User>
  ) {}

  async sendTemporaryPassword({ to }: EmailOptionsData, tmpPassword: string): Promise<AuthResponseDTO> {
    try {
      const user = await this.userReposiroty.findOneBy({ email: to });
      if (!user) 
        return { status: 'ErrNotFound', message: `User with email: ${to} not found` };

      const html = temporaryPasswordTemplate.replace('TMP_PASSWD', tmpPassword);

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

  async sendConfirmationEmail({ to }: EmailOptionsData, token: string): Promise<AuthResponseDTO> {
    try {
      const html = confirmationTemplate.replace('LINK', process.env.CONFIRM_EMAIL_URL);
      console.log(html);
      await this.mailerService.sendMail({
        to,
        subject: 'Confirm your email',
        html
      }).catch((err) => console.log(err));

      return { status: 'Success', message: `Email has been sent to: ${to}` };
    } catch (error) {
      console.log(error);
      return { status: 'Error', message: error.message };
    }
  }
}
