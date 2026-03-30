import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';
import envConfig from '../../shared/config';
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from '../../shared/constants/auth.constant';
import { generateOTP, isNotFoundError, isUniqueConstraintError } from '../../shared/helpers';
import { SharedUserRepository } from '../../shared/repositories/shared-user.repo';
import { EmailService } from '../../shared/services/email.service';
import { HashingService } from '../../shared/services/hashing.service';
import { TokenService } from '../../shared/services/token.service';
import { AccessTokenPayloadCreate } from '../../shared/types/jwt.type';
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOtpBodyType,
} from './auth.model';
import { AuthRepository } from './auth.repo';
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
} from './error.model';
import { RoleService } from './role.service';
import { TwoFactorAuthService } from 'src/shared/services/2fa.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async validateVerificationCode({
    email,
    type,
    code,
  }: {
    email: string;
    type: TypeOfVerificationCodeType;
    code: string;
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_type: {
        email,
        type,
      },
    });
    if (!verificationCode || verificationCode.code !== code) {
      throw InvalidOTPException;
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }
    return verificationCode;
  }

  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
        code: body.code,
      });
      const clientRoleId = await this.roleService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);

      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_type: {
            email: body.email,
            type: TypeOfVerificationCode.FORGOT_PASSWORD,
          },
        }),
      ]);

      return user;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    const user = await this.sharedUserRepository.findUnique({ email: body.email });
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException;
    }
    if (body.type !== TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException;
    }
    const otp = generateOTP();
    await this.authRepository.createVerificationCode({
      email: body.email,
      code: otp,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    });

    const { error } = await this.emailService.sendOTP({ email: body.email, code: otp });
    if (error) {
      throw FailedToSendOTPException;
    }
    return { message: 'Gửi mã OTP thành công' };
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    });

    if (!user) {
      throw EmailNotFoundException;
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password);
    if (!isPasswordMatch) {
      throw InvalidPasswordException;
    }

    if (user.totpSecret) {
      if (!body.totpCode && !body.code) {
        throw InvalidTOTPAndCodeException;
      }
      if (body.totpCode) {
        const isTOTPValid = this.twoFactorAuthService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        });
        if (!isTOTPValid) {
          throw InvalidTOTPException;
        }
      } else if (body.code) {
        await this.validateVerificationCode({
          email: user.email,
          type: TypeOfVerificationCode.LOGIN,
          code: body.code,
        });
      }
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    });
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });
    return tokens;
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, deviceId, roleId, roleName }),
      this.tokenService.signRefreshToken({ userId }),
    ]);
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    });
    return { accessToken, refreshToken };
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      });
      if (!refreshTokenInDb) {
        throw RefreshTokenAlreadyUsedException;
      }

      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb;
      // 3. Cập nhật device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        userAgent,
        ip,
      });
      // 4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });
      // 5. Tạo mới accessToken và refreshToken
      const $tokens = this.generateTokens({ deviceId, userId, roleId, roleName });
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens]);
      return tokens;
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. Xóa refreshToken trong database
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });
      // 3. Cập nhật device là đã logout
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      });
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body;
    // 1. Kiểm tra email đã tồn tại trong database chưa
    const user = await this.sharedUserRepository.findUnique({
      email,
    });
    if (!user) {
      throw EmailNotFoundException;
    }
    //2. Kiểm tra mã OTP có hợp lệ không
    await this.validateVerificationCode({
      email,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
      code,
    });
    //3. Cập nhật lại mật khẩu mới và xóa đi OTP
    const hashedPassword = await this.hashingService.hash(newPassword);
    await Promise.all([
      // this.sharedUserRepository.update(
      //   { id: user.id },
      //   {
      //     password: hashedPassword,
      //     updatedById: user.id,
      //   },
      // ),
      this.authRepository.updateUser({ id: user.id }, { password: hashedPassword }),
      this.authRepository.deleteVerificationCode({
        email_type: {
          email: body.email,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ]);
    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  async setup2FA(userId: number) {
    //1. Lấy thong tin user, kiểm tra xem user có tồn tại hay không, và xem họ đã bật 2FA chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId });
    if (!user) {
      throw EmailNotFoundException;
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException;
    }
    //2. Tạo ra secret và uri
    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(user.email);
    //3. Cập nhật secret vào user trong database
    await this.authRepository.updateUser(
      { id: userId },
      {
        totpSecret: secret,
      },
    );
    //4. Trả về secret và uri
    return { secret, uri };
  }
}
