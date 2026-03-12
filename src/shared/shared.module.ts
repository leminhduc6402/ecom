import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';

const sharedServices = [PrismaService, HashingService, TokenService, AccessTokenGuard, ApiKeyGuard];

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
