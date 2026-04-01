import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
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
    PassportModule.register({ defaultStrategy: 'jwt' }), // ✅ FIXED: Changed from 'google' to 'jwt'
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy, // ✅ GoogleStrategy is registered
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    TwoFactorService,
    AuditService,
  ],
  exports: [
    AuthService,
    GoogleStrategy,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
})
export class AuthModule {}