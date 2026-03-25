import { Body, Controller, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { LoginBodyDto, RegisterBodyDto, RegisterResDto, SendOtpBodyDto } from './auth.dto';
import { AuthService } from './auth.service';
import { UserAgent } from '../../shared/decorators/user-agent.decorator';
import { IP } from '../../shared/decorators/ip.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() registerDTO: RegisterBodyDto) {
    const result = await this.authService.register(registerDTO);
    return result;
  }

  @Post('otp')
  sendOtp(@Body() sendOtpDTO: SendOtpBodyDto) {
    return this.authService.sendOtp(sendOtpDTO);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginBodyDto, @UserAgent() userAgent: string, @IP() ip: string) {
    return await this.authService.login({ ...loginDTO, userAgent, ip });
  }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Body() refreshTokenDTO: any) {
  //   const result = await this.authService.refreshToken(refreshTokenDTO.refreshToken);
  //   return result;
  // }

  // @Post('logout')
  // async logout(@Body() logoutDTO: any) {
  //   return await this.authService.logout(logoutDTO.refreshToken);
  // }
}
