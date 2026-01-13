import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TwoFactorService } from './two-factor.service'; // ✅ ADD
import { AuditService } from './audit.service'; // ✅ ADD
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: '7d' // ✅ Changed from 1h to 7 days
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    TwoFactorService, // ✅ ADD THIS
    AuditService, // ✅ ADD THIS
  ],
  exports: [AuthService],
})
export class AuthModule {}

