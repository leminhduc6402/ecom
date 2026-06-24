import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import * as path from 'path';
import { BrandTranslationModule } from 'src/routes/brand/brand-translation/brand-translation.module';
import { BrandModule } from 'src/routes/brand/brand.module';
import { CartModule } from 'src/routes/cart/cart.module';
import { CategoryTranslationModule } from 'src/routes/category/category-translation/category-translation.module';
import { CategoryModule } from 'src/routes/category/category.module';
import { MediaModule } from 'src/routes/media/media.module';
import { OrderModule } from 'src/routes/order/order.module';
import { PaymentModule } from 'src/routes/payment/payment.module';
import { ProductTranslationModule } from 'src/routes/product/product-translation/product-translation.module';
import { ProductModule } from 'src/routes/product/product.module';
import { UserModule } from 'src/routes/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentConsumer } from './queues/payment.consumer';
import { AuthModule } from './routes/auth/auth.module';
import { LanguageModule } from './routes/language/language.module';
import { PermissionModule } from './routes/permission/permission.module';
import { ProfileModule } from './routes/profile/profile.module';
import { RoleModule } from './routes/role/role.module';
import envConfig from './shared/config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ThrottlerBehindProxyGuard } from './shared/guards/throttler-behind-proxy.guard';
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe';
import { SharedModule } from './shared/shared.module';
import { WebsocketModule } from './websockets/websocket.module';
import { ReviewModule } from './routes/review/review.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RemoveRefreshTokenCronjob } from './cronjobs/remove-refresh-token.cronjob';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        serializers: {
          req(req: any) {
            return {
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
            };
          },
          res(res: any) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
        stream: pino.destination({
          dest: path.resolve('logs/app.log'),
          sync: false, // Asynchronous logging
          mkdir: true, // Create the directory if it doesn't exist
        }),
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [new KeyvRedis(envConfig.REDIS_URL)],
        };
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: envConfig.REDIS_URL,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    ProductModule,
    ProductTranslationModule,
    CartModule,
    OrderModule,
    PaymentModule,
    WebsocketModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    PaymentConsumer,
    RemoveRefreshTokenCronjob,
  ],
})
export class AppModule {}
