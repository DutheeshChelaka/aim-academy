import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorService } from './two-factor.service';
import { AuditService } from './audit.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorService: TwoFactorService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  // ========== REGISTRATION WITH EMAIL ==========

  async register(email: string, phoneNumber: string, password: string, name: string) {
    // Validate email format
    if (!this.emailService.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new BadRequestException('Email already registered');
    }

    // Check if phone number already exists
    const existingPhone = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone) {
      throw new BadRequestException('Phone number already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phoneNumber,
        password: hashedPassword,
        name,
        isVerified: false,
      },
    });

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        type: 'REGISTRATION',
        expiresAt,
        isUsed: false,
      },
    });

    // Send OTP via email
    const emailSent = await this.emailService.sendOTP(email, name, otpCode);

    if (!emailSent) {
      console.warn('Failed to send email, but user registered. OTP:', otpCode);
    }

    return {
      message: 'Registration successful. Please check your email for OTP.',
      email: user.email,
      ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
    };
  }

  async verifyOTP(email: string, code: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Find valid OTP
    const otp = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'REGISTRATION',
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, phoneNumber: user.phoneNumber, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ========== LOGIN - EMAIL ONLY ==========

  async login(identifier: string, password: string, ipAddress?: string, userAgent?: string) {
    console.log('🔍 Login attempt:', {
      identifier,
      passwordProvided: password,
      passwordLength: password.length,
    });

    // Find user by email only
    const user = await this.prisma.user.findUnique({
      where: { email: identifier },
    });

    console.log('👤 User found:', user ? {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      hasPassword: !!user.password,
      passwordHashPreview: user.password.substring(0, 30) + '...',
    } : 'null');

    if (!user) {
      console.log('❌ User not found');
      // Log failed attempt
      if (ipAddress) {
        try {
          await this.auditService.log(
            'unknown',
            'LOGIN_FAILED',
            { identifier, reason: 'User not found' },
            ipAddress,
            userAgent,
          );
        } catch (error) {
          console.error('Failed to log audit:', error);
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if verified
    if (!user.isVerified) {
      console.log('❌ User not verified');
      throw new UnauthorizedException('Please verify your email first');
    }

    // Verify password
    console.log('🔐 Comparing password...');
    console.log('Password from request:', password);
    console.log('Hash from database:', user.password);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('✅ Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password invalid');
      // Log failed attempt
      if (ipAddress) {
        try {
          await this.auditService.log(
            user.id,
            'LOGIN_FAILED',
            { reason: 'Invalid password' },
            ipAddress,
            userAgent,
          );
        } catch (error) {
          console.error('Failed to log audit:', error);
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      console.log('🔐 2FA enabled, sending temp token');
      // Generate temporary token for 2FA verification (5 minutes)
      const tempToken = this.jwtService.sign(
        { sub: user.id, type: 'temp' },
        { expiresIn: '5m' }
      );

      return {
        requiresTwoFactor: true,
        tempToken,
        message: 'Please enter your 2FA code',
      };
    }

    // Normal login (no 2FA)
    console.log('✅ Login successful, generating token');
    const payload = { sub: user.id, email: user.email, phoneNumber: user.phoneNumber, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Log successful login
    if (ipAddress) {
      try {
        await this.auditService.log(
          user.id,
          'LOGIN_SUCCESS',
          { twoFactorUsed: false },
          ipAddress,
          userAgent,
        );
      } catch (error) {
        console.error('Failed to log audit:', error);
      }
    }

    console.log('🎉 Login complete!');

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  async resendOTP(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        type: 'REGISTRATION',
        expiresAt,
        isUsed: false,
      },
    });

    // Send OTP via email
    const emailSent = await this.emailService.sendOTP(user.email, user.name, otpCode);

    if (!emailSent) {
      console.warn('Failed to send email. OTP:', otpCode);
    }

    return {
      message: 'OTP sent to your email successfully',
      ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
    };
  }

  // ========== 2FA METHODS ==========

  async adminLogin(
    phoneNumber: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.auditService.log(
        user.id,
        'ADMIN_LOGIN_FAILED',
        { reason: 'Invalid password' },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, type: 'temp' },
        { expiresIn: '5m' },
      );

      return {
        requiresTwoFactor: true,
        tempToken,
        message: 'Please enter your 2FA code',
      };
    }

    await this.auditService.log(
      user.id,
      'ADMIN_LOGIN_SUCCESS',
      { twoFactorUsed: false },
      ipAddress,
      userAgent,
    );

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verify2FA(
    tempToken: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    let decoded;
    try {
      decoded = this.jwtService.verify(tempToken);
      if (decoded.type !== 'temp') {
        throw new Error('Invalid token type');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    const isValid = this.twoFactorService.verifyToken(
      totpCode,
      user.twoFactorSecret,
    );

    if (!isValid) {
      const action = user.role === 'ADMIN' ? 'ADMIN_2FA_FAILED' : '2FA_FAILED';
      await this.auditService.log(
        user.id,
        action,
        { reason: 'Invalid TOTP code' },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const action = user.role === 'ADMIN' ? 'ADMIN_LOGIN_SUCCESS' : 'LOGIN_SUCCESS';
    await this.auditService.log(
      user.id,
      action,
      { twoFactorUsed: true },
      ipAddress,
      userAgent,
    );

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyAdmin2FA(
    tempToken: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.verify2FA(tempToken, totpCode, ipAddress, userAgent);
  }

  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new BadRequestException('Only admins can enable 2FA');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }

    const { secret, qrCode } = await this.twoFactorService.generateSecret(
      user.name,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      qrCode,
      message: 'Scan this QR code with Google Authenticator app',
    };
  }

  async enable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not setup. Call setup2FA first');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }

    const isValid = this.twoFactorService.verifyToken(
      token,
      user.twoFactorSecret,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    await this.auditService.log(
      userId,
      'ADMIN_2FA_ENABLED',
      { success: true },
    );

    return {
      message: '2FA enabled successfully',
      enabled: true,
    };
  }

  async disable2FA(userId: string, password: string, totpCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const isValid = this.twoFactorService.verifyToken(
        totpCode,
        user.twoFactorSecret,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await this.auditService.log(
      userId,
      'ADMIN_2FA_DISABLED',
      { success: true },
    );

    return {
      message: '2FA disabled successfully',
      enabled: false,
    };
  }

  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled || false,
    };
  }

  // ========== PASSWORD RESET METHODS ==========

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: 'If this email is registered, you will receive a password reset link.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        used: false,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetLink);

    return {
      message: 'If this email is registered, you will receive a password reset link.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (resetRecord.used) {
      throw new UnauthorizedException('This reset link has already been used');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw new UnauthorizedException('This reset link has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return {
      message: 'Password reset successful',
    };
  }

  async validateResetToken(token: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.used || new Date() > resetRecord.expiresAt) {
      return { valid: false };
    }

    return { valid: true };
  }
}