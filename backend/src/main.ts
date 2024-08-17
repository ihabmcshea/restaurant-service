import dotenv from 'dotenv';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { AppModule } from './modules/app/app.module';
// import { HttpExceptionFilter } from './modules/filter/HttpException.filter';
import { API_PREFIX } from './shared/constants/global.constants';
import { GLOBAL_CONFIG } from './config/global.config';
import { SwaggerConfig } from './config/config.interface';
import { HttpExceptionFilter } from './common/filters/HttpExceptionFilter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Log errors and warnings
  });

  // Set global prefix for all routes
  app.setGlobalPrefix(API_PREFIX);

  // Configure CORS
  app.use(
    cors({
      origin: process.env.FRONTEND_URL, // Frontend URL allowed for CORS
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed methods
      credentials: true, // Allow credentials (cookies) to be included in CORS requests
    }),
  );

  // Parse cookies
  app.use(cookieParser());

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTOs
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const configService = app.get<ConfigService>(ConfigService);
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  if (swaggerConfig && swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'User Registration API')
      .setDescription(
        swaggerConfig.description || 'The User Registration API description',
      )
      .setVersion(swaggerConfig.version || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(swaggerConfig.path || 'api', app, document);
  } else {
    console.warn('Swagger is disabled or the configuration is missing.');
  }

  const PORT = process.env.BACKEND_PORT || GLOBAL_CONFIG.nest.port;
  await app.listen(4000, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

bootstrap();
