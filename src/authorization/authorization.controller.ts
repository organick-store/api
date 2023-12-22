import { Body, Controller, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { AuthorizationService } from './services/authorization.service';
import { SignUpSchema } from './schemas/sign-up.schema';
import { Response } from 'express';
import { SignInSchema } from './schemas/sign-in.schema';
import { ForgotPasswordSchema } from './schemas/forgot-password.schema';
import { AuthorizationGuard } from './guards/authorization.guard';
import { ResetPasswordSchema } from './schemas/reset-password.schema';
import { JWTPayload } from './decorators/jwt-payload.decorator';
import { IJWTPayload } from './interfaces/jwt-payload.interface';

@Controller('api/auth')
export class AuthorizationController {
  constructor(
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post('signup')
  public async signup(
    @Body() schema: SignUpSchema,
    @Res() res: Response
  ): Promise<void> {
    const token = await this.authorizationService.signup(schema);

    res.send({ token });
  }

  @Post('signin')
  public async signin(
    @Body() schema: SignInSchema,
    @Res() res: Response
  ): Promise<void> {
    const token = await this.authorizationService.signin(
      schema.email,
      schema.password
    );

    res.send({ token });
  }

  @Put('confirm-email/:token')
  public async confirm(
    @Param('token') token: string,
    @Res() res: Response
  ): Promise<void> {
    const confirmed = await this.authorizationService.confirmEmail(token);

    res.send({ confirmed });
  }

  @Post('forgot-password')
  public async forgotPassword(
    @Body() schema: ForgotPasswordSchema,
    @Res() res: Response
  ): Promise<void> {
    const recovered = await this.authorizationService.recoverPassword(schema.email);

    res.send({ recovered });
  }

  @Put('reset-password')
  @UseGuards(AuthorizationGuard)
  public async resetPassword(
    @Body() schema: ResetPasswordSchema,
    @JWTPayload() jwtPayload: IJWTPayload,
    @Res() res: Response
  ): Promise<void> {
    const reset = await this.authorizationService.resetPassword(
      jwtPayload.sub,
      schema.newPassword,
    );

    res.send({ reset });
  }
}
