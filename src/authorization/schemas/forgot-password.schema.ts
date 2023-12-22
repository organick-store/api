import { IsEmail } from 'class-validator';

export class ForgotPasswordSchema {
  @IsEmail()
  public readonly email: string;
}