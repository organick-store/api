import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../../mail/services/mail.service';
import { AuthorizationService } from '../services/authorization.service';
import { UserService } from '../../user/services/user.service';
import { TemporaryPasswordService } from '../../user/services/temporary-password.service';
import { EncryptionService } from '../services/encryption.service';
import { generateRandomUser } from '../../user/tests/utils/generate-random-user.util';
import { ISignUp } from '../interfaces/sign-up.interface';
import { User } from '../../user/entities/user.entity';
import { AuthorizationError } from '../authorization.error';
import { generateRandomTemporaryPassword } from '../../user/tests/utils/generate-random-temporary-password.utils';

describe('AuthorizationService', () => {
  let jwtService: JwtService;
  let userService: UserService;
  let mailService: MailService;
  let configService: ConfigService;
  let service: AuthorizationService;
  let encryptionService: EncryptionService;
  let temporaryPasswordService: TemporaryPasswordService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        AuthorizationService,
        {
          provide: MailService,
          useValue: {
            sendAccountConfirmation: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn()
          }
        },
        {
          provide: UserService,
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: TemporaryPasswordService,
          useValue: {
            update: jest.fn(),
            create: jest.fn(),
            findWithRelationsByUserId: jest.fn()
          }
        },
        {
          provide: EncryptionService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    mailService = moduleRef.get<MailService>(MailService);
    userService = moduleRef.get<UserService>(UserService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    service = moduleRef.get<AuthorizationService>(AuthorizationService);
    encryptionService = moduleRef.get<EncryptionService>(EncryptionService);
    temporaryPasswordService = moduleRef.get<TemporaryPasswordService>(
      TemporaryPasswordService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully signup user', async () => {
      const payload: ISignUp = {
        name: crypto.randomBytes(4).toString('hex'),
        phone: crypto.randomBytes(4).toString('hex'),
        email: crypto.randomBytes(4).toString('hex'),
        address: crypto.randomBytes(4).toString('hex'),
        password: crypto.randomBytes(4).toString('hex')
      };

      const user = generateRandomUser(payload);
      const hash = crypto.randomBytes(4).toString('hex');

      const token = crypto.randomBytes(4).toString('hex');

      jest.spyOn(userService, 'find').mockResolvedValue(null);
      jest.spyOn(encryptionService, 'hashPassword').mockResolvedValue(hash);
      jest.spyOn(configService, 'get').mockReturnValue('30d');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);
      jest
        .spyOn(mailService, 'sendAccountConfirmation')
        .mockResolvedValue(undefined);
      jest.spyOn(userService, 'create').mockResolvedValue(user as User);

      const result = await service.signup(payload);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email: payload.email
        }
      });

      expect(encryptionService.hashPassword).toBeCalledTimes(1);
      expect(encryptionService.hashPassword).toBeCalledWith(payload.password);

      expect(jwtService.signAsync).toBeCalledTimes(1);
      expect(jwtService.signAsync).toBeCalledWith(
        { email: payload.email },
        {
          expiresIn: '30d'
        }
      );

      expect(mailService.sendAccountConfirmation).toBeCalledTimes(1);
      expect(mailService.sendAccountConfirmation).toBeCalledWith(
        payload.email,
        token
      );

      expect(userService.create).toBeCalledTimes(1);
      expect(userService.create).toBeCalledWith({
        ...payload,
        password: hash
      });

      expect(result).toBe(token);
    });

    it('should throw error if user already exists', async () => {
      const error = AuthorizationError.UserAlreadyExists();
      const payload: ISignUp = {
        name: crypto.randomBytes(4).toString('hex'),
        phone: crypto.randomBytes(4).toString('hex'),
        email: crypto.randomBytes(4).toString('hex'),
        address: crypto.randomBytes(4).toString('hex'),
        password: crypto.randomBytes(4).toString('hex')
      };

      const user = generateRandomUser(payload);

      jest.spyOn(userService, 'find').mockResolvedValue(user as User);

      await expect(service.signup(payload)).rejects.toThrow(error);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email: payload.email
        }
      });

      expect(encryptionService.hashPassword).toBeCalledTimes(0);

      expect(jwtService.signAsync).toBeCalledTimes(0);

      expect(mailService.sendAccountConfirmation).toBeCalledTimes(0);

      expect(userService.create).toBeCalledTimes(0);
    });
  });

  describe('signin', () => {
    it('should sucessfully sign in user with default password', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(4).toString('hex');
      const user = generateRandomUser({ email });

      const token = crypto.randomBytes(4).toString('hex');

      jest.spyOn(userService, 'find').mockResolvedValue(user as User);
      jest
        .spyOn(temporaryPasswordService, 'findWithRelationsByUserId')
        .mockResolvedValue(null);
      jest.spyOn(encryptionService, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(configService, 'get').mockReturnValue('30d');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await service.signin(email, password);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(
        temporaryPasswordService.findWithRelationsByUserId
      ).toBeCalledTimes(1);
      expect(temporaryPasswordService.findWithRelationsByUserId).toBeCalledWith(
        user.id
      );

      expect(encryptionService.comparePassword).toBeCalledTimes(1);
      expect(encryptionService.comparePassword).toBeCalledWith(
        password,
        user.password
      );

      expect(jwtService.signAsync).toBeCalledTimes(1);
      expect(jwtService.signAsync).toBeCalledWith(
        { email },
        {
          expiresIn: '30d'
        }
      );

      expect(result).toBe(token);
    });

    it('should sucessfully sign in user with temporary password', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const token = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(4).toString('hex');

      const user = generateRandomUser({ email });
      const temporaryPassword = generateRandomTemporaryPassword({
        password,
        user: {
          id: user.id
        }
      });

      jest.spyOn(userService, 'find').mockResolvedValue(user as User);
      jest
        .spyOn(temporaryPasswordService, 'findWithRelationsByUserId')
        .mockResolvedValue(temporaryPassword as any);
      jest.spyOn(encryptionService, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(configService, 'get').mockReturnValue('30d');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await service.signin(email, password);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(
        temporaryPasswordService.findWithRelationsByUserId
      ).toBeCalledTimes(1);
      expect(temporaryPasswordService.findWithRelationsByUserId).toBeCalledWith(
        user.id
      );

      expect(encryptionService.comparePassword).toBeCalledTimes(1);
      expect(encryptionService.comparePassword).toBeCalledWith(
        password,
        temporaryPassword.password
      );

      expect(jwtService.signAsync).toBeCalledTimes(1);
      expect(jwtService.signAsync).toBeCalledWith(
        { email },
        {
          expiresIn: '30d'
        }
      );

      expect(result).toBe(token);
    });

    it('should throw error if user not found', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(4).toString('hex');

      const error = AuthorizationError.UserNotFound();

      jest.spyOn(userService, 'find').mockResolvedValue(null);

      await expect(service.signin(email, password)).rejects.toThrow(error);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(
        temporaryPasswordService.findWithRelationsByUserId
      ).toBeCalledTimes(0);

      expect(encryptionService.comparePassword).toBeCalledTimes(0);

      expect(jwtService.signAsync).toBeCalledTimes(0);
    });

    it('should throw error if password is incorrect', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(4).toString('hex');

      const user = generateRandomUser({ email });

      const error = AuthorizationError.WrongPassword();

      jest.spyOn(userService, 'find').mockResolvedValue(user as User);
      jest
        .spyOn(temporaryPasswordService, 'findWithRelationsByUserId')
        .mockResolvedValue(null);
      jest.spyOn(encryptionService, 'comparePassword').mockResolvedValue(false);

      await expect(service.signin(email, password)).rejects.toThrow(error);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(
        temporaryPasswordService.findWithRelationsByUserId
      ).toBeCalledTimes(1);
      expect(temporaryPasswordService.findWithRelationsByUserId).toBeCalledWith(
        user.id
      );

      expect(encryptionService.comparePassword).toBeCalledTimes(1);
      expect(encryptionService.comparePassword).toBeCalledWith(
        password,
        user.password
      );

      expect(jwtService.signAsync).toBeCalledTimes(0);
    });
  });

  describe('confirmEmail', () => {
    it('should successfully confirm email', async () => {
      const token = crypto.randomBytes(4).toString('hex');
      const email = crypto.randomBytes(4).toString('hex');
      const user = generateRandomUser({ email });

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ email });
      jest.spyOn(userService, 'find').mockResolvedValue(user as User);
      jest.spyOn(userService, 'update').mockResolvedValue(true);

      const result = await service.confirmEmail(token);

      expect(jwtService.verifyAsync).toBeCalledTimes(1);
      expect(jwtService.verifyAsync).toBeCalledWith(token);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(userService.update).toBeCalledTimes(1);
      expect(userService.update).toBeCalledWith({
        where: {
          email
        },
        fields: {
          isVerified: true
        }
      });

      expect(result).toBe(true);
    });

    it('should throw error if user not found', async () => {
      const token = crypto.randomBytes(4).toString('hex');
      const email = crypto.randomBytes(4).toString('hex');

      const error = AuthorizationError.UserNotFound();

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ email });
      jest.spyOn(userService, 'find').mockResolvedValue(null);

      await expect(service.confirmEmail(token)).rejects.toThrow(error);

      expect(jwtService.verifyAsync).toBeCalledTimes(1);
      expect(jwtService.verifyAsync).toBeCalledWith(token);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(userService.update).toBeCalledTimes(0);
    });
  });

  describe('recoverPassword', () => {
    it('should successfully recover password', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const user = generateRandomUser({ email });
      const hash = crypto.randomBytes(4).toString('hex');

      const temporaryPassword = generateRandomTemporaryPassword({
        user: {
          id: user.id
        }
      });

      jest.spyOn(userService, 'find').mockResolvedValue(user as User);
      jest
        .spyOn(temporaryPasswordService, 'findWithRelationsByUserId')
        .mockResolvedValue(temporaryPassword as any);
      jest.spyOn(encryptionService, 'hashPassword').mockResolvedValue(hash);
      jest.spyOn(temporaryPasswordService, 'update').mockResolvedValue(true);

      const result = await service.recoverPassword(email);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(
        temporaryPasswordService.findWithRelationsByUserId
      ).toBeCalledTimes(1);
      expect(temporaryPasswordService.findWithRelationsByUserId).toBeCalledWith(
        user.id
      );

      expect(encryptionService.hashPassword).toBeCalledTimes(1);
      expect(encryptionService.hashPassword).toBeCalledWith(expect.any(String));

      expect(temporaryPasswordService.update).toBeCalledTimes(1);
      expect(temporaryPasswordService.update).toBeCalledWith({
        where: {
          id: temporaryPassword.id
        },
        fields: {
          password: hash,
          expiresAt: expect.any(Date)
        }
      });

      expect(result).toBe(true);
    });

    it('should throw error if user not found', async () => {
      const email = crypto.randomBytes(4).toString('hex');

      const error = AuthorizationError.UserNotFound();

      jest.spyOn(userService, 'find').mockResolvedValue(null);

      await expect(service.recoverPassword(email)).rejects.toThrow(error);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(
        temporaryPasswordService.findWithRelationsByUserId
      ).toBeCalledTimes(0);

      expect(encryptionService.hashPassword).toBeCalledTimes(0);

      expect(temporaryPasswordService.update).toBeCalledTimes(0);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(4).toString('hex');
      const user = generateRandomUser({ email });
      const hash = crypto.randomBytes(4).toString('hex');

      jest.spyOn(userService, 'find').mockResolvedValue(user as User);
      jest.spyOn(encryptionService, 'hashPassword').mockResolvedValue(hash);
      jest.spyOn(userService, 'update').mockResolvedValue(true);

      const result = await service.resetPassword(email, password);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(encryptionService.hashPassword).toBeCalledTimes(1);
      expect(encryptionService.hashPassword).toBeCalledWith(password);

      expect(userService.update).toBeCalledTimes(1);
      expect(userService.update).toBeCalledWith({
        where: {
          email
        },
        fields: {
          password: hash
        }
      });

      expect(result).toBe(true);
    });

    it('should throw error if user not found', async () => {
      const email = crypto.randomBytes(4).toString('hex');
      const password = crypto.randomBytes(4).toString('hex');

      const error = AuthorizationError.UserNotFound();

      jest.spyOn(userService, 'find').mockResolvedValue(null);

      await expect(service.resetPassword(email, password)).rejects.toThrow(
        error
      );

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email
        }
      });

      expect(encryptionService.hashPassword).toBeCalledTimes(0);

      expect(userService.update).toBeCalledTimes(0);
    });
  });
});
