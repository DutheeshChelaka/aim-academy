import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhooks
  });
  
  
  app.enableCors({
    origin: ['http://localhost:3001', 'http://192.168.1.3:3001'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ ADD RATE LIMITING FOR ADMIN LOGIN
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to admin routes
  app.use('/auth/admin/login', adminLoginLimiter);
  app.use('/auth/admin/verify-2fa', adminLoginLimiter);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🔐 Admin 2FA endpoints available at /auth/admin/*`);
}
bootstrap();