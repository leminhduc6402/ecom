import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
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
import { UserAgent } from '../../shared/decorators/user-agent.decorator';
import { IP } from '../../shared/decorators/ip.decorator';
import { MessageResDTO } from '../../shared/dtos/response.dto';
import { IsPublic } from '../../shared/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
