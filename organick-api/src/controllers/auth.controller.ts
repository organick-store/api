import {
  Controller,
  Post,
  Body,
  Response,
  Put,
  Param
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCreatedResponse, ApiBody, ApiParam } from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';

import { UserDTO } from '../DTOs/user.dto';
import { AuthResponseDTO } from '../DTOs/authResponse.dto';
import { SigninDTO } from '../DTOs/signin.dto';
import { EmailDTO } from '../DTOs/email.dto';
import { PasswordDTO } from '../DTOs/password.dto';
import { createTemporearyPassword } from '../utils/tmpPassword.util';

@Controller()
@ApiTags('User authorisation')
export class AuthController {
  constructor(private readonly userService: UserService, private readonly mailService: EmailService) {}

  @Post('/signup')
  @ApiCreatedResponse({
    description: 'User has been successfully created.',
    type: AuthResponseDTO
  })
  @ApiResponse({ status: 201, description: 'User has been successfully created.'})
  @ApiResponse({ status: 202, description: 'Error. User already exists'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiBody({ type: UserDTO })
  async singup(@Body() body: UserDTO, @Response() res) {
    try {
      const { name, email, password, phone, address } = body;
      const registration = await this.userService.register(
        name,
        email,
        password,
        phone,
        address
      );
      if (!!registration.message) return await res.status(202).send(registration);
      else {  
        await this.mailService.sendConfirmationEmail({ to: email }, registration.token);
        return await res.status(201).send(registration);
      }
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }

  @Post('/signin')
  @ApiResponse({ status: 200, description: 'Singin success. Token has been updated'})
  @ApiResponse({ status: 202, description: 'Error. Wrong password'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiCreatedResponse({
    description: 'User has been successfully authorized.',
    type: AuthResponseDTO
  })
  @ApiBody({ type: SigninDTO })
  async signin(@Body() body: SigninDTO, @Response() res) {
    try {
      const signin = await this.userService.signin(body.email, body.password);
      if (!!signin.message) res.status(202).send(signin);
      else res.status(200).send(signin);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }

  @Put('/confirm-email/:token')
  @ApiResponse({ status: 200, description: 'Email has been confirmed'})
  @ApiResponse({ status: 404, description: 'Error. User not found'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiParam({ name: 'token', type: String })
  async confirmEmail(@Param('token') token: string, @Response() res) {
    try {
      const confirmEmail = await this.userService.confirmEmail(token);
      if (confirmEmail.message === 'Error') res.status(404).send(confirmEmail);
      else res.status(200).send(confirmEmail);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }

  @Post('/forgot-password')
  @ApiResponse({ status: 200, description: 'Email has been sent. Password has been updated'})
  @ApiResponse({ status: 404, description: 'Error. User not found'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiBody({ type: EmailDTO })
  async forgotPassword(@Body() body: EmailDTO, @Response() res) {
    try {
      const tmpPassword = createTemporearyPassword();
      const forgotPassword = await this.mailService.sendTemporaryPassword({ to: body.email }, tmpPassword);
      await this.userService.setTemporaryPassword(body.email, tmpPassword);
      if (forgotPassword.status === 'Success') res.status(200).send(forgotPassword);
      else res.status(404).send(forgotPassword);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }

  @Post('/reset-password')
  @ApiResponse({ status: 200, description: 'Password has been updated'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiBody({ type: PasswordDTO })
  async resetPassword(@Body() body: PasswordDTO, @Response() res) {
    try {
      const resetPassword = await this.userService.resetPassword(body.oldPassword, body.newPassword, body.token);
      if (resetPassword.status === 'Success') res.status(200).send(resetPassword);
      else res.status(404).send(resetPassword);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }

  @Put('/refresh/:token')
  @ApiResponse({ status: 200, description: 'Token has been updated'})
  @ApiResponse({ status: 404, description: 'Error. User not found'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiParam({ name: 'token', type: String })
  async refresh(@Param('token') token: string, @Response() res) {
    try {
      const refresh = await this.userService.refresh(token);
      if (refresh.message === 'Error') res.status(404).send(refresh);
      else res.status(200).send(refresh);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }
}
