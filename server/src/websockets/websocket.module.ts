import { Module } from '@nestjs/common';
import { ChatGateway } from 'src/websockets/chat.gateway';
import { PaymentGateway } from './payment.gateway';

@Module({
  providers: [ChatGateway, PaymentGateway],
  exports: [PaymentGateway],
})
export class WebsocketModule {}
