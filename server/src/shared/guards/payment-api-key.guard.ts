import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import envConfig from '../config';

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const paymentApiKey = request.headers['payment-api-key'];
    if (paymentApiKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
