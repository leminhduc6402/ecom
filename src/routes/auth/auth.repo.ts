import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { RegisterBodyType, VerificationCodeType } from './auth.model';
import { UserType } from '../../shared/models/shared-user.model';
import { TypeOfVerificationCodeType } from '../../shared/constants/auth.constant';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createVerificationCode(payload: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>) {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: payload.email,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findUniqueVerificationCode(
    uniqueValue: // | { email: string }
      { id: number } | { email_type: { email: string; type: TypeOfVerificationCodeType } },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }
}
