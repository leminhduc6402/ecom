import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { MessageResType } from 'src/shared/models/response.model';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}

  async receiver(body: WebhookPaymentBodyType): Promise<MessageResType> {
    return this.paymentRepo.receiver(body);
  }
}
