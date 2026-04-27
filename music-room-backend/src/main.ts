import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(AppConfigService);

  // Security
  app.use(helmet());

  // CORS
  // In development we allow any chrome-extension:// origin so the unpacked
  // extension works regardless of its generated ID.
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = [
        configService.webAppUrl,
        configService.extensionOrigin,
      ];

      // Always allow any chrome-extension:// origin in development
      if (
        configService.isDevelopment &&
        origin.startsWith('chrome-extension://')
      ) {
        return callback(null, true);
      }

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
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

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  if (configService.isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Music Room API')
      .setDescription('Low-latency music room platform API')
      .setVersion('1.0')
      .addTag('users', 'User management')
      .addTag('rooms', 'Room management')
      .addTag('livekit', 'LiveKit token generation')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    logger.log('Swagger documentation available at /api/docs');
  }

  const port = configService.port;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.nodeEnv}`);
  logger.log(`Web App URL: ${configService.webAppUrl}`);
  logger.log(`Extension Origin: ${configService.extensionOrigin}`);
}

bootstrap();
