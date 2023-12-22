import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParserService } from './parser.service';
import { IInvoice } from '../interfaces/invoice.interface';
import { ISendInvoice } from '../interfaces/send-invoice.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly parserService: ParserService,
    private readonly mailerService: MailerService,
  ) {}

  public async sendAccountConfirmation(email: string, token: string): Promise<void> {
    const link = this.configService.get<string>('CONFIRM_EMAIL_URL') + token;
    const html = this.parserService.parseConfirmation(link);

    await this.mailerService.sendMail({
      html,
      to: email,
      subject: 'User confirmation',
    });
  }

  public async sendTemporaryPassword(email: string, password: string): Promise<void> {
    const html = this.parserService.parseTemporaryPassword(password);

    await this.mailerService.sendMail({
      html,
      to: email,
      subject: 'Temporary password',
    });
  }

  public async sendInvoice(payload: ISendInvoice): Promise<void> {
    const html = this.parserService.parseInvoice(payload.invoice);

    console.log(html);

    await this.mailerService.sendMail({
      html,
      to: payload.email,
      subject: 'Invoice',
    });
  }
}
