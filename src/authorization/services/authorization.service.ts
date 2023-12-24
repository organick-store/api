import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { ConfigService } from '@nestjs/config';
import { ISignUp } from '../interfaces/sign-up.interface';
import { EncryptionService } from './encryption.service';
import { AuthorizationError } from '../authorization.error';
import { MailService } from '../../mail/services/mail.service';
import { TemporaryPasswordService } from '../../user/services/temporary-password.service';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly temporaryPasswordService: TemporaryPasswordService
  ) {}

  public async signup(payload: ISignUp): Promise<string> {
    const user = await this.userService.find({
      where: {
        email: payload.email
      }
    });

    if (user) {
      throw AuthorizationError.UserAlreadyExists();
    }

    const hash = await this.encryptionService.hashPassword(payload.password);

    const token = await this.jwtService.signAsync(
      { email: payload.email },
      {
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME')
      }
    );

    await this.mailService.sendAccountConfirmation(payload.email, token);

    await this.userService.create({
      ...payload,
      password: hash
    });

    return token;
  }

  public async signin(email: string, password: string): Promise<string> {
    const user = await this.userService.find({
      where: {
        email
      }
    });

    if (!user) {
      throw AuthorizationError.UserNotFound();
    }

    const temporaryPassword =
      await this.temporaryPasswordService.findWithRelationsByUserId(user.id);

    const passwordToCheck = temporaryPassword?.password || user.password;

    const isPasswordCorrect = await this.encryptionService.comparePassword(
      password,
      passwordToCheck
    );
    if (!isPasswordCorrect) {
      throw AuthorizationError.WrongPassword();
    }

    const token = await this.jwtService.signAsync(
      { email },
      {
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME')
      }
    );

    return token;
  }

  public async confirmEmail(token: string): Promise<boolean> {
    const jwtPayload = await this.jwtService.verifyAsync(token);

    const user = await this.userService.find({
      where: {
        email: jwtPayload.email
      }
    });

    if (!user) {
      throw AuthorizationError.UserNotFound();
    }

    const confirmed = await this.userService.update({
      fields: {
        isVerified: true
      },
      where: {
        email: jwtPayload.email
      }
    });

    return confirmed;
  }

  public async recoverPassword(email: string): Promise<boolean> {
    const user = await this.userService.find({
      where: {
        email
      }
    });

    if (!user) {
      throw AuthorizationError.UserNotFound();
    }

    const temporaryPassword =
      await this.temporaryPasswordService.findWithRelationsByUserId(user.id);

    const password = crypto.randomBytes(4).toString('hex');
    const hashed = await this.encryptionService.hashPassword(password);

    if (temporaryPassword) {
      const updated = await this.temporaryPasswordService.update({
        where: {
          id: temporaryPassword.id
        },
        fields: {
          password: hashed,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
        }
      });

      return updated;
    }

    await this.temporaryPasswordService.create(user.id, hashed);

    await this.mailService.sendTemporaryPassword(email, password);

    return true;
  }

  public async resetPassword(
    email: string,
    password: string
  ): Promise<boolean> {
    const user = await this.userService.find({
      where: {
        email
      }
    });

    if (!user) {
      throw AuthorizationError.UserNotFound();
    }

    const temporaryPassword =
      await this.temporaryPasswordService.findWithRelationsByUserId(user.id);

    if (temporaryPassword) {
      await this.temporaryPasswordService.deleteByUserId(user.id);
    }

    const hashed = await this.encryptionService.hashPassword(password);

    const updated = await this.userService.update({
      where: {
        email
      },
      fields: {
        password: hashed
      }
    });

    return updated;
  }
}
