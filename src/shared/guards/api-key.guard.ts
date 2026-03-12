import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import envConfig from '../config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const xApiKey = request.headers['x-api-key'];
    if (xApiKey !== envConfig.API_KEY) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
