import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AuthResponseDTO {
  @IsString()
  @ApiProperty({
    description: 'Result of registration',
    type: String
  })
  status: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Optional error message',
    type: String,
    nullable: true
  })
  message?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Token for authorisation',
    type: String,
    nullable: true
  })
  token?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User name',
    type: String,
    nullable: true
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User email',
    type: String,
    nullable: true
  })
  email?: string;
}
