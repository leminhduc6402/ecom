import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';

export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, { ...options, cors: { origin: '*', credentials: true } });
    // server.use(this.authMiddleware);

    const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
      socket.on('disconnect', () => {
        console.log('Socket disconnected: ', socket.id);
      });
      next();
    };

    server.of('payment').use(authMiddleware);
    server.of('chat').use(authMiddleware);
    return server;
  }
}
