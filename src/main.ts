import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: true, cors: true });

  const config = new DocumentBuilder()
    .setTitle('Local Component')
    .setDescription('Documentation of services for Local Component')
    .setVersion('1.0')
    .addTag('local')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(helmet());
  await app.listen(process.env.PORT);
}

bootstrap();