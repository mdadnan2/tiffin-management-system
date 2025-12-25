import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConsulClient } from '@app/common/consul-client';
import { AllExceptionsFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and authorization endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Auth Service running on http://0.0.0.0:${port}`);
  console.log(`Swagger docs available at http://0.0.0.0:${port}/api/docs`);

  const consul = new ConsulClient();
  await consul.register();

  process.on('SIGTERM', async () => {
    await consul.deregister();
    await app.close();
  });
}
bootstrap();
