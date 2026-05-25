import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { MessageResType } from 'src/shared/models/response.model';
import { PaymentProducer } from './payment.producer';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepo,
    private readonly paymentProducer: PaymentProducer,
  ) {}

  async receiver(body: WebhookPaymentBodyType): Promise<MessageResType> {
    const { paymentId } = await this.paymentRepo.receiver(body);
    await this.paymentProducer.removeJob(paymentId);
    return {
      message: 'Payment success',
    };
  }
}
