import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatbotsModule } from './modules/chatbots/chatbots.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { AIModule } from './modules/ai/ai.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { LoggerService } from './common/services/logger.service';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  securityConfig,
  loggingConfig,
  uploadConfig,
  aiConfig,
  vectorStoreConfig,
} from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        securityConfig,
        loggingConfig,
        uploadConfig,
        aiConfig,
        vectorStoreConfig,
      ],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    } as unknown as import('@nestjs/throttler').ThrottlerModuleOptions),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ChatbotsModule,
    ConversationsModule,
    AIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
