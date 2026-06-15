import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { PaymentApiKeyGuard } from './guards/payment-api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { SharedUserRepository } from './repositories/shared-user.repo';
import { EmailService } from './services/email.service';
import { TwoFactorAuthService } from './services/2fa.service';
import { SharedRoleRepository } from './repositories/shared-role.repo';
import { S3Service } from 'src/shared/services/s3.service';
import { SharedPaymentRepo } from './repositories/shared-payment.repo';
import { SharedWebsocketRepository } from './repositories/shared-websocket';

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  AccessTokenGuard,
  PaymentApiKeyGuard,
  SharedUserRepository,
  TwoFactorAuthService,
  SharedRoleRepository,
  S3Service,
  SharedPaymentRepo,
  SharedWebsocketRepository,
];

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    {
      useClass: AuthenticationGuard,
      provide: APP_GUARD,
    },
  ],
  exports: [...sharedServices],
})
export class SharedModule {}
