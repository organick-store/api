import { IsEmail, IsString, Length } from 'class-validator';

export class SignInSchema {
  @IsEmail()
  public readonly email: string;

  @IsString()
  @Length(8)
  public readonly password: string;
}