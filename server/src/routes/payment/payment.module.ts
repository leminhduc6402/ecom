import { Global, Module } from '@nestjs/common';

import { PaymentController } from 'src/routes/payment/payment.controller';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import { PaymentService } from 'src/routes/payment/payment.service';
import { PaymentProducer } from './payment.producer';
import { BullModule } from '@nestjs/bullmq';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentRepo, PaymentService, PaymentProducer],
})
export class PaymentModule {}
