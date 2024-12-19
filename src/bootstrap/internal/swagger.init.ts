import { INestApplication, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'

export function initializeSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Uliana Prisma Web Telegram App Server API')
    .setDescription('The dragon farm API description with Zod schema validation')
    .setVersion('1.0')
    //.addTag('cats')
    .setContact('Sergey Inozemcev', 'https://t.me/indiecaps', 'indicogames@yandex.ru')
    .addBearerAuth()
    .addTag('auth')
    .addTag('player')
    .addTag('ping-pong')
    .addTag('for-stars-shop')
    .addTag('action')
    .addTag('fortune')
    .addTag('location')
    .build()
  patchNestJsSwagger()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  //if (process.env.NODE_ENV === 'development') {
  //  app.enableCors(localhostCorsConfig);
  Logger.log('Swagger initialized', 'Bootstrap')
  //}
}