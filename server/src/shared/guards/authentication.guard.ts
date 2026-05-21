import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const authTypeValue = this.getAuthTypeValue(context);

    const guards = authTypeValue.authType.map((type) => this.authTypeGuardMap[type]);

    return authTypeValue.options.condition === ConditionGuard.Or
      ? this.handleOrCondition(guards, context)
      : this.handleAndCondition(guards, context);
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authType: [AuthType.Bearer], options: { condition: ConditionGuard.Or } };
    return authTypeValue;
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    let lastError: unknown = null;

    for (const guard of guards) {
      try {
        const result = await guard.canActivate(context);

        if (result) return true;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof HttpException) {
      throw lastError;
    }

    throw new UnauthorizedException();
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);

        if (!canActivate) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new UnauthorizedException();
      }
    }

    return true;
  }
}
