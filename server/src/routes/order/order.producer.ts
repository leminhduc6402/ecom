import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { generateCancelPaymentJobId } from 'src/shared/helpers';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private readonly paymentQueue: Queue) {}

  async cancelPaymentJob(paymentId: number) {
    return this.paymentQueue.add(
      'cancelPayment',
      { paymentId },
      {
        delay: 1000 * 20, // 20s
        jobId: generateCancelPaymentJobId(paymentId),
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
