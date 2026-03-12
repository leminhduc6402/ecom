import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterBodyDto, RegisterResDto } from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() registerDTO: RegisterBodyDto) {
    const result = await this.authService.register(registerDTO)
    return result
  }

  @Post('login')
  async login(@Body() loginDTO: any) {
    return await this.authService.login(loginDTO)
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDTO: any) {
    const result = await this.authService.refreshToken(refreshTokenDTO.refreshToken)
    return result
  }

  @Post('logout')
  async logout(@Body() logoutDTO: any) {
    return await this.authService.logout(logoutDTO.refreshToken)
  }
}
