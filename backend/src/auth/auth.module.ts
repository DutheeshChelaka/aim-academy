import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard'; // ✅ ADD
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard'; // ✅ ADD
import { TwoFactorService } from './two-factor.service';
import { AuditService } from './audit.service';
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
    JwtAuthGuard, // ✅ ADD
    OptionalJwtAuthGuard, // ✅ ADD
    TwoFactorService,
    AuditService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard, // ✅ ADD
    OptionalJwtAuthGuard, // ✅ ADD
  ],
})
export class AuthModule {}