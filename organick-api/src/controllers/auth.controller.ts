import {
  Controller,
  Post,
  Body,
  Get,
  Response,
  Request
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';

import { UserDTO } from '../DTOs/user.dto';
import { AuthResponseDTO } from '../DTOs/authResponse.dto';
import { SigninDTO } from '../DTOs/signin.dto';
import { CurrentUserDTO } from '../DTOs/currentUser.dto';
import { EmailDTO } from '../DTOs/email.dto';
import { PasswordDTO } from '../DTOs/password.dto';

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
      const { name, email, password, birthdate, about } = body;
      const registration = await this.userService.register(
        name,
        email,
        password,
        birthdate,
        about
      );
      if (!!registration.message) res.status(202).send(registration);
      else res.status(201).send(registration);
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

  @Post('/forgot-password')
  @ApiResponse({ status: 200, description: 'Email has been sent. Password has been updated'})
  @ApiResponse({ status: 404, description: 'Error. User not found'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @ApiBody({ type: EmailDTO })
  async forgotPassword(@Body() body: EmailDTO, @Response() res) {
    try {
      const forgotPassword = await this.mailService.sendEmail({ to: body.email });
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
      const resetPassword = await this.userService.resetPassword(body.password, body.token);
      if (resetPassword.status === 'Success') res.status(200).send(resetPassword);
      else res.status(404).send(resetPassword);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }
}
