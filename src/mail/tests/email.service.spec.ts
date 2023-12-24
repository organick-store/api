import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from '../services/mail.service';
import { invoiceTemplate } from '../templates/invoice.template';
import { confirmationTemplate } from '../templates/confirmation.template';
import { temporaryPasswordTemplate } from '../templates/temporary-password.template';
import { ParserService } from '../services/parser.service';

describe('EmailService', () => {
  let service: MailService;
  let parserService: ParserService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        ConfigService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn()
          }
        },
        {
          provide: ParserService,
          useValue: {
            parseInvoice: jest.fn(),
            parseConfirmation: jest.fn(),
            parseTemporaryPassword: jest.fn()
          }
        }
      ]
    }).compile();

    service = moduleRef.get<MailService>(MailService);
    parserService = moduleRef.get<ParserService>(ParserService);
    mailerService = moduleRef.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTemporaryPassword', () => {
    it('should successfully send email with temporary password', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(16).toString('hex');
      const html = temporaryPasswordTemplate.replace('TMP_PASSWD', password);

      jest.spyOn(parserService, 'parseTemporaryPassword').mockReturnValue(html);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendTemporaryPassword(email, password);

      expect(parserService.parseTemporaryPassword).toBeCalledTimes(1);
      expect(parserService.parseTemporaryPassword).toBeCalledWith(password);

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toBeCalledWith({
        html,
        to: email,
        subject: 'Temporary password'
      });

      expect(result).toBeUndefined();
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should successfully send confirmation email', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const token = crypto.randomBytes(16).toString('hex');
      const confirmationLink = process.env.CONFIRM_EMAIL_URL + token;
      const html = confirmationTemplate.replace('LINK', confirmationLink);

      jest.spyOn(parserService, 'parseConfirmation').mockReturnValue(html);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendAccountConfirmation(email, token);

      expect(parserService.parseConfirmation).toBeCalledTimes(1);
      expect(parserService.parseConfirmation).toBeCalledWith(confirmationLink);

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toBeCalledWith({
        html,
        to: email,
        subject: 'User confirmation'
      });

      expect(result).toBeUndefined();
    });
  });

  describe('sendOrderEmail', () => {
    it('should successfully send order email', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const address = crypto.randomBytes(16).toString('hex');
      const products = [
        {
          quantity: crypto.randomInt(1, 5),
          name: crypto.randomBytes(4).toString('hex')
        },
        {
          quantity: crypto.randomInt(1, 5),
          name: crypto.randomBytes(4).toString('hex')
        }
      ];
      const productsMessage =
        `${products[0].quantity} of item ${products[0].name}\n` +
        `${products[1].quantity} of item ${products[1].name}\n`;

      const html = invoiceTemplate
        .replace('PRODUCTS', productsMessage)
        .replace('DELIVERY_ADDRESS', address);

      jest.spyOn(parserService, 'parseInvoice').mockReturnValue(html);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendInvoice({
        email,
        invoice: {
          address,
          products
        }
      });

      expect(parserService.parseInvoice).toBeCalledTimes(1);
      expect(parserService.parseInvoice).toBeCalledWith({
        address,
        products
      });

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toBeCalledWith({
        html,
        to: email,
        subject: 'Invoice'
      });

      expect(result).toBeUndefined();
    });
  });
});
