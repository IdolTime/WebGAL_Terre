import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { _open } from './util/open';
import { urlencoded, json } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';

let WEBGAL_PORT = 3000; // default port
const version_number = `4.4.13`;
if (env.WEBGAL_PORT) {
  WEBGAL_PORT = Number.parseInt(env.WEBGAL_PORT);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const config = new DocumentBuilder()
    .setTitle('idoltime API')
    .setDescription('API Refrence of idoltime Editor')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(WEBGAL_PORT + 1);
}

bootstrap().then(() => {
  console.log(`idoltime ${version_number} starting at ${process.cwd()}`);
  if ((process?.env?.NODE_ENV ?? '') !== 'development')
    _open(`http://localhost:${WEBGAL_PORT + 1}`);
});
