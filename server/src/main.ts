import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { WebSocketAdapter } from './websockets/websocket.adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { DateToIsoInterceptor } from './shared/interceptor/date-to-iso.interceptor';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: '*', // Allow all origins (for development)
    credentials: true,
  });
  // app.useGlobalInterceptors(new DateToIsoInterceptor());
  // app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(helmet());

  app.set('trust proxy', 'loopback');

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('The API for the ecommerce application')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        name: 'authorization',
        type: 'apiKey',
      },
      'payment-api-key',
    )
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(documentFactory), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const websocketAdapter = new WebSocketAdapter(app);
  await websocketAdapter.connectToRedis();
  app.useWebSocketAdapter(websocketAdapter);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
