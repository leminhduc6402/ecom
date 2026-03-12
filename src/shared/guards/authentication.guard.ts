import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeyGuard } from './api-key.guard';
import { AuthType, ConditionGuard } from '../constants/auth.constant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>;
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? { authType: [AuthType.None], options: { condition: ConditionGuard.Or } };

    const guards = authTypeValue.authType.map((type) => this.authTypeGuardMap[type]);
    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const instance of guards) {
        const canActivate = await instance.canActivate(context);
        if (canActivate) {
          return true;
        }
      }
      throw new UnauthorizedException();
    } else {
      for (const instance of guards) {
        const canActivate = await instance.canActivate(context);
        if (!canActivate) {
          throw new UnauthorizedException();
        }
      }
    }
    return true;
  }
}
