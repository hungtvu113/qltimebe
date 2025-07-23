import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    console.log('Đang khởi động ứng dụng...');

    // Sử dụng Fastify thay vì Express
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

    console.log('Đã tạo ứng dụng NestJS');

    // Cấu hình CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://frontend:3000', // Cho phép từ Docker container
        process.env.FRONTEND_URL || 'http://localhost:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    console.log('Đã cấu hình CORS');

    // Cấu hình global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    console.log('Đã cấu hình validation pipe');

    // Cấu hình Swagger
    const config = new DocumentBuilder()
      .setTitle('QLTime API')
      .setDescription('API cho ứng dụng quản lý thời gian QLTime')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log('Đã cấu hình Swagger');

    // Khởi động server
    const port = process.env.PORT || 3001;
    console.log(`Đang khởi động server trên port ${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`Ứng dụng đang chạy tại: http://0.0.0.0:${port}`);
    console.log(`Swagger API docs: http://0.0.0.0:${port}/api/docs`);
  } catch (error) {
    console.error('Lỗi khi khởi động ứng dụng:', error);
    process.exit(1);
  }
}

bootstrap();
