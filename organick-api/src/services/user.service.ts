import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { verifyToken, decodeToken } from '../utils/token.util';
import { AuthResponseDTO } from '../DTOs/authResponse.dto';
import { UserDTO } from '../DTOs/user.dto';

dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposiroty: Repository<User>
  ) {}

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponseDTO> {
    const candidateEmail = await this.userReposiroty.findOneBy({ email });
    if (candidateEmail)
      return { status: 'error', message: 'User already exists' };

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME
    });
    const passwordHash = await bcrypt.hash(password, 3);

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = passwordHash;

    await this.userReposiroty.save(user);
    return { status: 'success', token: token };
  }

  async signin(email: string, password: string): Promise<AuthResponseDTO> {
    try {
      const user = await this.userReposiroty.findOneBy({ email });
      if (!user) return { status: 'error', message: 'User not found' };

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect)
        return { status: 'error', message: 'Wrong password' };

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME
      });

      return { status: 'success', token };
    } catch (error) {
      console.log(error);
    }
  }

  async resetPassword (newPassword: string, token: string): Promise<AuthResponseDTO> {
    try {
      const isTokenValid = await verifyToken(token).catch((err) => !!!err);
      if (!isTokenValid)
        return {
          status: 'Error',
          message: 'Token expired'
        };

      const email = await decodeToken(token).then((payload) => payload.to);
      const passwordHash = await bcrypt.hash(newPassword, 3);

      const user = this.userReposiroty.findOneBy({ email });
      if (!user) return { status: 'Error', message: 'User not found' };
      
      await this.userReposiroty.update({ email }, { password: passwordHash });
      return { status: 'Success', message: 'Password has been changed' };
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

