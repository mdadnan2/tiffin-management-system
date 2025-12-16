import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConsulClient } from '@app/common/consul-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  const port = 3004;
  await app.listen(port, '0.0.0.0');
  console.log(`Admin Service running on http://0.0.0.0:${port}`);

  const consul = new ConsulClient();
  await consul.register();

  process.on('SIGTERM', async () => {
    await consul.deregister();
    await app.close();
  });
}
bootstrap();
                