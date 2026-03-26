import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import envConfig from '../../shared/config';
import { IsPublic } from '../../shared/decorators/auth.decorator';
import { IP } from '../../shared/decorators/ip.decorator';
import { UserAgent } from '../../shared/decorators/user-agent.decorator';
import { MessageResDTO } from '../../shared/dtos/response.dto';
import {
  getAuthorizationUrlResDto,
  LoginBodyDto,
  LoginResDto,
  LogoutBodyDTO,
  RefreshTokenBodyDto,
  RefreshTokenResDto,
  RegisterBodyDto,
  RegisterResDto,
  SendOtpBodyDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @IsPublic()
  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  register(@Body() registerDTO: RegisterBodyDto) {
    const result = this.authService.register(registerDTO);
    return result;
  }

  @IsPublic()
  @Post('otp')
  @ZodSerializerDto(MessageResDTO)
  sendOtp(@Body() sendOtpDTO: SendOtpBodyDto) {
    return this.authService.sendOtp(sendOtpDTO);
  }

  @IsPublic()
  @Post('login')
  @ZodSerializerDto(LoginResDto)
  login(@Body() loginDTO: LoginBodyDto, @UserAgent() userAgent: string, @IP() ip: string) {
    return this.authService.login({ ...loginDTO, userAgent, ip });
  }

  @IsPublic()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDto)
  refreshToken(@Body() refreshTokenDTO: RefreshTokenBodyDto, @UserAgent() userAgent: string, @IP() ip: string) {
    const result = this.authService.refreshToken({ refreshToken: refreshTokenDTO.refreshToken, userAgent, ip });
    return result;
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() logoutDTO: LogoutBodyDTO) {
    return await this.authService.logout(logoutDTO.refreshToken);
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(getAuthorizationUrlResDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @IP() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip });
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({ code, state });
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}/auth/google/callback?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}/auth/google/callback?errorMessage=${message}`);
    }
  }
}
