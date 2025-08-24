import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet.default());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('app.corsOrigin'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
    ],
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Request ID middleware
  app.use((req, res, next) => {
    const requestId =
      req.headers['x-request-id'] ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  const port = configService.get('app.port');
  await app.listen(port);

  const logger = app.get(LoggerService);
  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(`Environment: ${configService.get('app.nodeEnv')}`, 'Bootstrap');
  logger.log(`API Prefix: ${configService.get('app.apiPrefix')}`, 'Bootstrap');
}

bootstrap();
