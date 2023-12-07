import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '../entities/user.entity';
import { EmailService } from '../services/email.service';
import { orderTemplate } from '../templates/order.template';
import { generateRandomUser } from './utils/generate-random-user.util';
import { confirmationTemplate } from '../templates/confirmation.template';
import { temporaryPasswordTemplate } from '../templates/tamporaryPassword.template';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;
  let userReposiroty: Repository<User>;

  const USER_REPO_TOKEN = getRepositoryToken(User);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            findOneBy: jest.fn()
          }
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn()
          }
        }
      ]
    }).compile();

    userReposiroty = moduleRef.get(USER_REPO_TOKEN);
    service = moduleRef.get<EmailService>(EmailService);
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
      const user = generateRandomUser();
      const emailOptionsData = { to: user.email };
      const tmpPassword = crypto.randomBytes(16).toString('hex');
      const html = temporaryPasswordTemplate.replace('TMP_PASSWD', tmpPassword);

      jest.spyOn(userReposiroty, 'findOneBy').mockResolvedValue(user as User);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendTemporaryPassword(
        emailOptionsData,
        tmpPassword
      );

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({ email: user.email });

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toBeCalledWith({
        html,
        to: user.email,
        subject: 'Access recovery'
      });

      expect(result).toEqual({
        status: 'Success',
        message: `Email has been sent to: ${user.email}`
      });
    });

    it('should return error if user not found', async () => {
      const user = generateRandomUser();
      const emailOptionsData = { to: user.email };
      const tmpPassword = crypto.randomBytes(16).toString('hex');

      jest.spyOn(userReposiroty, 'findOneBy').mockResolvedValue(null);

      const result = await service.sendTemporaryPassword(
        emailOptionsData,
        tmpPassword
      );

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({ email: user.email });

      expect(mailerService.sendMail).toBeCalledTimes(0);

      expect(result).toEqual({
        status: 'ErrNotFound',
        message: `User with email: ${user.email} not found`
      });
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should successfully send confirmation email', async () => {
      const user = generateRandomUser();
      const emailOptionsData = { to: user.email };
      const token = crypto.randomBytes(16).toString('hex');
      const html = confirmationTemplate.replace(
        'LINK',
        process.env.CONFIRM_EMAIL_URL + token
      );

      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendConfirmationEmail(
        emailOptionsData,
        token
      );

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toBeCalledWith({
        html,
        to: user.email,
        subject: 'Confirm your email'
      });

      expect(result).toEqual({
        status: 'Success',
        message: `Email has been sent to: ${user.email}`
      });
    });
  });

  describe('sendOrderEmail', () => {
    it('should successfully send order email', async () => {
      const user = generateRandomUser();
      const email = user.email;
      const products = [
        {
          quantity: 1,
          name: crypto.randomBytes(4).toString('hex')
        },
        {
          quantity: 2,
          name: crypto.randomBytes(4).toString('hex')
        }
      ];
      const orderId = crypto.randomInt(10);
      const address = crypto.randomBytes(16).toString('hex');

      const productsMessage = `${products[0].quantity} of item ${products[0].name}\n${products[1].quantity} of item ${products[1].name}\n`;
      const html = orderTemplate
        .replace('PRODUCTS', productsMessage)
        .replace('DELIVERY_ADDRESS', address);

      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendOrderEmail(
        email,
        products,
        orderId,
        address
      );

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mailerService.sendMail).toBeCalledWith({
        html,
        to: email,
        subject: `Order ${orderId}`
      });

      expect(result).toEqual({
        status: 'Success',
        message: `Email has been sent to: ${email}`
      });
    });
  });
});
