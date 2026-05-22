import { Global, Module } from '@nestjs/common';

import { PaymentController } from 'src/routes/payment/payment.controller';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import { PaymentService } from 'src/routes/payment/payment.service';

@Global()
@Module({
  controllers: [PaymentController],
  providers: [PaymentRepo, PaymentService],
})
export class PaymentModule {}
