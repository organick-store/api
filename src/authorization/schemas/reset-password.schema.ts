import { IsString, Length } from 'class-validator';

export class ResetPasswordSchema {
  @IsString()
  @Length(8)
  public readonly newPassword: string;
}
