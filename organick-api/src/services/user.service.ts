import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { User } from '../entities/user.entity';
import { verifyToken, decodeToken } from '../utils/token.util';
import { AuthResponseDTO } from '../DTOs/authResponse.dto';
import { UserDTO } from '../DTOs/user.dto';
import { TemporaryPassword } from '../entities/temporaryPasswords.entity';

dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposiroty: Repository<User>,
    @InjectRepository(TemporaryPassword) private readonly temporaryPasswordRepository: Repository<TemporaryPassword>
  ) {}

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponseDTO> {
    const candidateEmail = await this.userReposiroty.findOneBy({ email });
    if (candidateEmail)
      return { status: 'error', message: 'User already exists' };

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "test_secret_key", {
      expiresIn: process.env.JWT_EXPIRATION_TIME || "30h"
    });
    const passwordHash = await bcrypt.hash(password, 3);

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = passwordHash;

    await this.userReposiroty.save(user);
    return { status: 'Success', token, name: user.name, email: user.email };
  }

  async signin(email: string, password: string): Promise<AuthResponseDTO> {
    try {
      const user = await this.userReposiroty.findOneBy({ email });
      if (!user) return { status: 'error', message: 'User not found' };

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      
      const tempPassword = await this.temporaryPasswordRepository.findOneBy({ user });
      
      let isTempPasswordCorrect: boolean = false;
      if (!!tempPassword?.password) isTempPasswordCorrect = await bcrypt.compare(password, tempPassword.password);
      
      console.log(password, user.password, isPasswordCorrect, isTempPasswordCorrect)

      if (!isPasswordCorrect && !isTempPasswordCorrect)
        return { status: 'error', message: 'Wrong password' };

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME
      });

      return { status: 'Success', token, name: user.name, email: user.email };
    } catch (error) {
      console.log(error);
    }
  }

  async resetPassword (oldPassword: string, newPassword: string, token: string): Promise<AuthResponseDTO> {
    try {
      const isTokenValid = await verifyToken(token).catch((err) => !!!err);
      if (!isTokenValid)
        return {
          status: 'Error',
          message: 'Token expired'
        };

      const email = await decodeToken(token).then((payload) => payload.email);
      const user = await this.userReposiroty.findOneBy({ email });
      if (!user) return { status: 'Error', message: 'User not found' };
      
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

      const tempPassword = await this.temporaryPasswordRepository.findOneBy({ user });
      
      let isTempPasswordCorrect: boolean = true;
      if (!!tempPassword?.password) isTempPasswordCorrect = await bcrypt.compare(oldPassword, tempPassword?.password);
      
      if (!isOldPasswordCorrect && !isTempPasswordCorrect) return { status: 'error', message: 'Wrong password' };

      const newPasswordHash = await bcrypt.hash(newPassword, 3);
      await this.userReposiroty.update({ email }, { password: newPasswordHash });
      return { status: 'Success', message: 'Password has been changed' };
    } catch (error) {
      console.log(error);
    }
  }

  async setTemporaryPassword(email: string, temporaryPassword: string): Promise<AuthResponseDTO> {
    try {
      const user = await this.userReposiroty.findOneBy({ email });
      if (!user) return { status: 'Error', message: 'User not found' };

      const passwordHash = await bcrypt.hash(temporaryPassword, 3);

      const tmpPassword = new TemporaryPassword();
      tmpPassword.password = passwordHash;
      tmpPassword.user = user;

      console.log(temporaryPassword);

      const isTemporaryPasswordExist = await this.temporaryPasswordRepository.findOneBy({ user });
      if (isTemporaryPasswordExist) await this.temporaryPasswordRepository.update({ user }, tmpPassword);
      else await this.temporaryPasswordRepository.save(tmpPassword);
    } catch (error) {
      console.log(error);
    }
  }

  async confirmEmail(token: string): Promise<AuthResponseDTO> {
    try {
      const isTokenValid = await verifyToken(token).catch((err) => !!!err);
      if (!isTokenValid) return { status: 'Error', message: 'Token expired' };

      const email = await decodeToken(token).then((payload) => payload.email);
      await this.userReposiroty.update({ email }, { isVerified: true });
      return { status: 'Success', message: 'Email has been confirmed' };
    } catch (error) {
      console.log(error);
    }
  }

  async getAllUsers(): Promise<{ status: string, message?: string, result?: User[]}> {
    try {
      const users = await this.userReposiroty.find();
      if (!users) return { status: 'Error', message: 'Users not found' };

      const usersSecure = users.map((user) => {
        user.password = undefined;
        return user;
      });

      return {
        status: 'Success',
        result: usersSecure
      };
    } catch (error) {
      console.log(error);
    }
  }

  async createUser(user: UserDTO): Promise<AuthResponseDTO> {
    try {
      const candidateEmail = await this.userReposiroty.findOneBy({ email: user.email });
      if (candidateEmail) return { status: 'Error', message: 'User already exists' };

      const passwordHash = await bcrypt.hash(user.password, 3);

      const newUser = new User();
      newUser.name = user.name;
      newUser.email = user.email;
      newUser.password = passwordHash;

      await this.userReposiroty.save(newUser);
      return { status: 'Success', message: 'User has been created' };
    } catch (error) {
      console.log(error);
    }
  }

  async updateUser(newData: UserDTO): Promise<AuthResponseDTO> {
    try {
      const updateUser = this.userReposiroty.update({ email: newData.email }, newData);
      if (!updateUser) return { status: 'Error', message: 'User not found' };
      return { status: 'Success', message: 'User has been updated' };
    } catch (error) {
      console.log(error);
    }
  }


  async deleteUser(email: string): Promise<AuthResponseDTO> {
    try {
      const deleteUser = this.userReposiroty.delete({ email });
      if (!deleteUser) return { status: 'error', message: 'User not found' };
      return { status: 'success', message: 'User has been deleted' };
    } catch (error) {
      console.log(error);
    }
  }
}

