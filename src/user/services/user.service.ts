import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ICreateUser } from '../interfaces/create-user.interface';
import { IUserEntity } from '../interfaces/user-entity.interface';
import { IFindUser } from '../interfaces/find-user.interface';
import { IUpdateUser } from '../interfaces/update-user.interface';
import { UserError } from '../user.error';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposiroty: Repository<User>
  ) {}

  public async create(payload: ICreateUser): Promise<IUserEntity> {
    const user = this.userReposiroty.create(payload);

    return this.userReposiroty.save(user);
  }

  public async find(payload: IFindUser): Promise<IUserEntity> {
    const user = await this.userReposiroty.findOne(payload);

    return user;
  }

  public async update(payload: IUpdateUser): Promise<boolean> {
    const updated = await this.userReposiroty.update(
      payload.where,
      payload.fields
    );

    if (updated.affected === 0) {
      throw UserError.UserNotUpdated();
    }

    return true;
  }
}
