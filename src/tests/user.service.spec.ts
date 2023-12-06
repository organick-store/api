import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../services/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TemporaryPassword } from '../entities/temporaryPasswords.entity';
import { Repository } from 'typeorm';
import { generateRandomUser } from './utils/generate-random-user.util';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import e from 'express';


describe('UserService', () => {
  let service: UserService;
  let userReposiroty: Repository<User>;
  let temporaryPasswordRepository: Repository<TemporaryPassword>;

  const USER_REPO_TOKEN = getRepositoryToken(User);
  const TEMP_PASSWORD_REPO_TOKEN = getRepositoryToken(TemporaryPassword);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            findOneBy: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn()
          }
        },
        {
          provide: TEMP_PASSWORD_REPO_TOKEN,
          useValue: {
            findOneBy: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    userReposiroty = moduleRef.get(USER_REPO_TOKEN);
    temporaryPasswordRepository = moduleRef.get(TEMP_PASSWORD_REPO_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('userReposiroty should be defined', () => {
    expect(userReposiroty).toBeDefined();
  });

  it('temporaryPasswordRepository should be defined', () => {
    expect(temporaryPasswordRepository).toBeDefined();
  });

  describe('register', () => {
    it('should register user', async () => {
      const user = generateRandomUser();
      const hash = crypto.randomBytes(16).toString('hex');
      const token = crypto.randomBytes(16).toString('hex');

      jest.spyOn(userReposiroty, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(jwt, 'sign').mockReturnValue(token as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hash as never);
      jest.spyOn(userReposiroty, 'save').mockResolvedValue(user as User);

      const result = await service.register(
        user.name,
        user.email,
        user.password,
        user.phone,
        user.address
      );

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({ email: user.email });

      expect(jwt.sign).toBeCalledTimes(1);
      expect(jwt.sign).toBeCalledWith(
        { email: user.email },
        "test_secret_key",
        { expiresIn: "30h" }
      );

      expect(bcrypt.hash).toBeCalledTimes(1);
      expect(bcrypt.hash).toBeCalledWith(user.password, 3);

      expect(userReposiroty.save).toBeCalledTimes(1);
      expect(userReposiroty.save).toBeCalledWith({
        name: user.name,
        email: user.email,
        password: hash,
        phone: user.phone,
        address: user.address,
      });

      expect(result).toEqual({
        status: 'Success',
        token,
        name: user.name,
        email: user.email,
        address: user.address
      });
    });

    it('should not register user', async () => {
      const user = generateRandomUser();

      jest.spyOn(userReposiroty, 'findOneBy').mockResolvedValue(user as User);
      jest.spyOn(jwt, 'sign');
      jest.spyOn(bcrypt, 'hash');

      const result = await service.register(
        user.name,
        user.email,
        user.password,
        user.phone,
        user.address
      );

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({ email: user.email });

      expect(jwt.sign).toBeCalledTimes(0);

      expect(bcrypt.hash).toBeCalledTimes(0);

      expect(userReposiroty.save).toBeCalledTimes(0);

      expect(result).toEqual({
        status: 'Error',
        message: 'User already exists'
      });
    });

    it('should throw internal repository error', async () => {
      const user = generateRandomUser();
      const hash = crypto.randomBytes(16).toString('hex');
      const token = crypto.randomBytes(16).toString('hex');
      const error = new Error('internal repository error');

      jest.spyOn(userReposiroty, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(jwt, 'sign').mockReturnValue(token as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hash as never);
      jest.spyOn(userReposiroty, 'save').mockRejectedValue(error);

      await expect(service.register(
        user.name,
        user.email,
        user.password,
        user.phone,
        user.address
      )).rejects.toThrow(error);

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({ email: user.email });

      expect(jwt.sign).toBeCalledTimes(1);
      expect(jwt.sign).toBeCalledWith(
        { email: user.email },
        "test_secret_key",
        { expiresIn: "30h" }
      );

      expect(bcrypt.hash).toBeCalledTimes(1);
      expect(bcrypt.hash).toBeCalledWith(user.password, 3);

      expect(userReposiroty.save).toBeCalledTimes(1);
      expect(userReposiroty.save).toBeCalledWith({
        name: user.name,
        email: user.email,
        password: hash,
        phone: user.phone,
        address: user.address,
      });
    });
  });

  describe('signin', () => {
    it('should signin user', async () => {
      await service.signin('email', 'password');
      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      await service.resetPassword('oldPassword', 'newPassword', 'token');
      expect(userReposiroty.findOneBy).toBeCalledTimes(0);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      await service.deleteUser('email');
      expect(userReposiroty.delete).toBeCalledTimes(1);
    });
  });

  describe('getAllUsers', () => {
    it('should get all users', async () => {
      await service.getAllUsers();
      expect(userReposiroty.find).toBeCalledTimes(1);
    });
  });


  describe('sendTemporaryPassword', () => {
    it('should send temporary password', async () => {
      await service.setTemporaryPassword('email', '12345678');
      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email', async () => {
      const mail = await service.confirmEmail('token');
      expect(mail.status).toBe('Error');
    });
  });


  describe('refresh', () => {
    it('should not refrech token', async () => {
      const token = await service.refresh('token');
      expect(token.status).toBe('Error');
    });
  });
});
