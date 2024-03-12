import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { AuthorizationService } from './services/authorization.service';
import { SignUpSchema } from './schemas/sign-up.schema';
import { Response } from 'express';
import { SignInSchema } from './schemas/sign-in.schema';
import { ForgotPasswordSchema } from './schemas/forgot-password.schema';
import { AuthorizationGuard } from './guards/authorization.guard';
import { ResetPasswordSchema } from './schemas/reset-password.schema';
import { JWTPayload } from './decorators/jwt-payload.decorator';
import { IJWTPayload } from './interfaces/jwt-payload.interface';
import {
  ApiCreatedResponse,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiParam
} from '@nestjs/swagger';
import { AuthorizationResponse } from './responses/authorization.response';
import { ConfirmEmailResponse } from './responses/confirm-email.response';
import { ForgotPasswordResponse } from './responses/forgot-password.response';
import { UserEntityResponse } from './responses/user-entity.response';

@Controller('api/auth')
@ApiTags('User authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Post('signup')
  @ApiCreatedResponse({
    status: 201,
    type: AuthorizationResponse,
    description: 'User has been successfully created'
  })
  @ApiResponse({ status: 401, description: 'Error. User already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: SignUpSchema })
  public async signup(
    @Body() schema: SignUpSchema,
    @Res() res: Response
  ): Promise<void> {
    const token = await this.authorizationService.signup(schema);

    res.send(new AuthorizationResponse(token));
  }

  @Post('signin')
  @ApiCreatedResponse({
    status: 201,
    type: AuthorizationResponse,
    description: 'User has been successfully created'
  })
  @ApiResponse({ status: 401, description: 'Error. User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: SignInSchema })
  public async signin(
    @Body() schema: SignInSchema,
    @Res() res: Response
  ): Promise<void> {
    const token = await this.authorizationService.signin(
      schema.email,
      schema.password
    );

    res.send(new AuthorizationResponse(token));
  }

  @Put('confirm-email/:token')
  @ApiResponse({
    status: 200,
    type: ConfirmEmailResponse,
    description: 'Email has been confirmed'
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ type: String, name: 'token' })
  public async confirm(
    @Param('token') token: string,
    @Res() res: Response
  ): Promise<void> {
    const confirmed = await this.authorizationService.confirmEmail(token);

    res.send(new ConfirmEmailResponse(confirmed));
  }

  @Post('forgot-password')
  @ApiResponse({
    status: 200,
    type: ForgotPasswordResponse,
    description: 'Email has been sent. Password has been updated'
  })
  @ApiResponse({ status: 403, description: 'Error. User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ForgotPasswordSchema })
  public async forgotPassword(
    @Body() schema: ForgotPasswordSchema,
    @Res() res: Response
  ): Promise<void> {
    const recovered = await this.authorizationService.recoverPassword(
      schema.email
    );

    res.send(new ForgotPasswordResponse(recovered));
  }

  @Put('reset-password')
  @UseGuards(AuthorizationGuard)
  @ApiResponse({
    status: 200,
    type: ForgotPasswordResponse,
    description: 'Password has been updated'
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ResetPasswordSchema })
  public async resetPassword(
    @Body() schema: ResetPasswordSchema,
    @JWTPayload() jwtPayload: IJWTPayload,
    @Res() res: Response
  ): Promise<void> {
    const reset = await this.authorizationService.resetPassword(
      jwtPayload.sub,
      schema.newPassword
    );

    res.send(new ForgotPasswordResponse(reset));
  }

  @Get('/current-user')
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: 200,
    type: UserEntityResponse,
    description: 'Current user'
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async currentUser(
    @JWTPayload() jwtPayload: IJWTPayload
  ): Promise<UserEntityResponse> {
    const user = await this.authorizationService.getCurrentUser(jwtPayload.sub);

    return new UserEntityResponse(user);
  }
}
