import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { generateCancelPaymentJobId } from 'src/shared/helpers';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';

@Injectable()
export class PaymentProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private readonly paymentQueue: Queue) {}

  removeJob(paymentId: number) {
    return this.paymentQueue.remove(generateCancelPaymentJobId(paymentId));
  }
}
