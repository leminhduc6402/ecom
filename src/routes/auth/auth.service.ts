import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';
import envConfig from '../../shared/config';
import { generateOTP, isUniqueConstraintError } from '../../shared/helpers';
import { SharedUserRepository } from '../../shared/repositories/shared-user.repo';
import { HashingService } from '../../shared/services/hashing.service';
import { RegisterBodyType, SendOtpBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { RoleService } from './role.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.roleService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);

      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ]);
      }
      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    const user = await this.sharedUserRepository.findUnique({ email: body.email });
    if (user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email đã tồn tại',
          path: 'email',
        },
      ]);
    }
    const otp = generateOTP();
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code: otp,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    });

    return verificationCode;
  }

  // async login(body: any) {
  //   const user = await this.prismaService.user.findFirst({
  //     where: {
  //       email: body.email,
  //     },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException('Account is not exist');
  //   }

  //   const isPasswordMatch = await this.hashingService.compare(body.password, user.password);
  //   if (!isPasswordMatch) {
  //     throw new UnprocessableEntityException([
  //       {
  //         field: 'password',
  //         error: 'Password is incorrect',
  //       },
  //     ]);
  //   }
  //   const tokens = await this.generateTokens({ userId: user.id });
  //   return tokens;
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ]);
  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       deviceId: 0,
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   });
  //   return { accessToken, refreshToken };
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // 1. Kiểm tra refreshToken có hợp lệ không
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
  //     // 2. Kiểm tra refreshToken có tồn tại trong database không
  //     await this.prismaService.refreshToken.findUniqueOrThrow({
  //       where: {
  //         token: refreshToken,
  //       },
  //     });
  //     // 3. Xóa refreshToken cũ
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     });
  //     // 4. Tạo mới accessToken và refreshToken
  //     return await this.generateTokens({ userId });
  //   } catch (error) {
  //     // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
  //     // refresh token của họ đã bị đánh cắp
  //     if (isNotFountError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked');
  //     }
  //     throw new UnauthorizedException();
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // 1. Kiểm tra refreshToken có hợp lệ không
  //     await this.tokenService.verifyRefreshToken(refreshToken);
  //     // 2. Xóa refreshToken trong database
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     });
  //     return { message: 'Logout successfully' };
  //   } catch (error) {
  //     // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
  //     // refresh token của họ đã bị đánh cắp
  //     if (isNotFountError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked');
  //     }
  //     throw new UnauthorizedException();
  //   }
  // }
}
