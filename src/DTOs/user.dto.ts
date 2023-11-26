import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UserDTO {
  @IsString()
  @ApiProperty({
    description: 'User name',
    type: String
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    description: 'User email',
    type: String
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'User phone',
    type: String
  })
  phone: string;

  @IsString()
  @ApiProperty({
    description: 'User address',
    type: String
  })
  address: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @ApiProperty({
    description: 'User password',
    type: String
  })
  password?: string;
}
