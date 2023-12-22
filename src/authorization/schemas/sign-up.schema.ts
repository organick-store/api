import { IsEmail, IsPhoneNumber, IsString, Length } from 'class-validator';

export class SignUpSchema {
  @IsString()
  public readonly name: string;

  @IsEmail()
  public readonly email: string;

  @IsString()
  @Length(8)
  public readonly password: string;

  @IsPhoneNumber()
  public readonly phone?: string;

  @IsString()
  public readonly address?: string;
}