import { ApiProperty } from '@nestjs/swagger';
import { IUserEntity } from 'src/user/interfaces/user-entity.interface';

export class UserEntityRespponse {
  @ApiProperty({ example: 1 })
  public readonly id: number;

  @ApiProperty({ example: 'John' })
  public readonly name: string;

  @ApiProperty({ example: 'john@gmail.com' })
  public readonly email: string;

  @ApiProperty({ example: 'password' })
  public readonly password: string;

  @ApiProperty({ example: '123456789' })
  public readonly phone?: string;

  @ApiProperty({ example: 'New York' })
  public readonly address?: string;

  @ApiProperty({ example: true })
  public readonly isVerified: boolean;

  constructor(user: IUserEntity) {
    Object.assign(this, user);
  }
}
