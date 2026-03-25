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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  register(@Body() registerDTO: RegisterBodyDto) {
    const result = this.authService.register(registerDTO);
    return result;
  }

  @Post('otp')
  sendOtp(@Body() sendOtpDTO: SendOtpBodyDto) {
    return this.authService.sendOtp(sendOtpDTO);
  }

  @Post('login')
  @ZodSerializerDto(LoginResDto)
  login(@Body() loginDTO: LoginBodyDto, @UserAgent() userAgent: string, @IP() ip: string) {
    return this.authService.login({ ...loginDTO, userAgent, ip });
  }

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
