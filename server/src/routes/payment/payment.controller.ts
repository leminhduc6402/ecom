import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from 'src/routes/payment/payment.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { WebhookPaymentBodyDTO } from './payment.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @IsPublic()
  @Post('/receiver')
  @ZodSerializerDto(MessageResDTO)
  async receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body);
  }
}
