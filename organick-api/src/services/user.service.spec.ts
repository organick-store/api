import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TemporaryPassword } from '../entities/temporaryPasswords.entity';
import { Repository } from 'typeorm';

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
    it('should register new user', async () => {
      await service.register('username', 'user@email.com', 'password');
      expect(userReposiroty.save).toBeCalledTimes(1);
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
