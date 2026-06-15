import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'payment',
})
export class PaymentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send-money')
  handleEvent(@MessageBody() data: string): string {
    this.server.emit('receive-money', {
      data: `Hello ${data}`,
    });
    return data;
  }
}
