import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('BuildMart API')
    .setDescription('API documentation for BuildMart')
    .setVersion('1.0')
    .addTag('users')
    .addTag('auth')
    .addTag('products')
    .addTag('merchants')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      theme: 'purple',
      layout: 'classic',
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
