import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { WebSocketAdapter } from './websockets/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*', // Allow all origins (for development)
    credentials: true,
  });

  app.useWebSocketAdapter(new WebSocketAdapter(app));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
