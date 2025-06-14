import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT') || 3000;
  
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('CRM-BACKEND')
    .setDescription('APIS FOR MANAGING CRM BACKEND')
    .setVersion('1.0')
    .addBearerAuth() // Add this line to include Bearer token auth
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

    // CORS configuration
    const corsOptions: CorsOptions = {
      origin: '*', // You can restrict this to specific domains
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true, // Enable credentials if needed
    };
    app.enableCors(corsOptions);

  await app.listen(port);
}
bootstrap();