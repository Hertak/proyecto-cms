import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './commons/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from './commons/guards/auth.guard';
import { RolesGuard } from './commons/guards/roles.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  if (process.env.NODE_ENV === 'development') {
    const options = new DocumentBuilder()
      .setTitle('API Proyecto CMS')
      .setDescription('Esta es la documentación técnica de la api rest del Backend')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
  const configService = app.get(ConfigService);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalGuards(app.get(JwtAuthGuard), app.get(RolesGuard));
  app.useGlobalFilters(new AllExceptionsFilter(configService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(3000);
}
bootstrap();
