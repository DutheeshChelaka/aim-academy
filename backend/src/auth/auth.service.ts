import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorService } from './two-factor.service';
import { AuditService } from './audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorService: TwoFactorService,
    private auditService: AuditService,
  ) {}

  // ========== EXISTING METHODS ==========

  async register(phoneNumber: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new BadRequestException('Phone number already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
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
        expiresAt,
        isUsed: false,
      },
    });

    // In production, send OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otpCode}`);

    return {
      message: 'Registration successful. OTP sent.',
      phoneNumber: user.phoneNumber,
      otp: otpCode, // Remove in production
    };
  }

  async verifyOTP(phoneNumber: string, code: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Find valid OTP
    const otp = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code,
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

    // Generate JWT token
    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ✅ UPDATED LOGIN WITH 2FA SUPPORT
  async login(phoneNumber: string, password: string, ipAddress?: string, userAgent?: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Log failed attempt
      if (ipAddress) {
        try {
          await this.auditService.log(
            'unknown',
            'LOGIN_FAILED',
            { phoneNumber, reason: 'User not found' },
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
      throw new UnauthorizedException('Please verify your phone number first');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
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

    // ✅ CHECK IF 2FA IS ENABLED
    if (user.twoFactorEnabled && user.twoFactorSecret) {
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
    const payload = { sub: user.id, phoneNumber: user.phoneNumber, role: user.role };
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

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  async resendOTP(phoneNumber: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
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
        expiresAt,
        isUsed: false,
      },
    });

    // In production, send OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otpCode}`);

    return {
      message: 'OTP sent successfully',
      otp: otpCode, // Remove in production
    };
  }

  // ========== NEW 2FA METHODS ==========

  /**
   * Admin Login - Step 1: Verify credentials
   */
  async adminLogin(
    phoneNumber: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    // Check if user exists and is admin
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed attempt
      await this.auditService.log(
        user.id,
        'ADMIN_LOGIN_FAILED',
        { reason: 'Invalid password' },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token (valid for 5 minutes)
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

    // If no 2FA, generate access token and log
    await this.auditService.log(
      user.id,
      'ADMIN_LOGIN_SUCCESS',
      { twoFactorUsed: false },
      ipAddress,
      userAgent,
    );

    const accessToken = this.jwtService.sign({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Verify 2FA code (works for both admin and regular users)
   */
  async verify2FA(
    tempToken: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Verify temp token
    let decoded;
    try {
      decoded = this.jwtService.verify(tempToken);
      if (decoded.type !== 'temp') {
        throw new Error('Invalid token type');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    // Verify TOTP code
    const isValid = this.twoFactorService.verifyToken(
      totpCode,
      user.twoFactorSecret,
    );

    if (!isValid) {
      // Log failed 2FA attempt
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

    // Success - log and generate access token
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
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Admin Login - Step 2: Verify 2FA code (kept for backward compatibility)
   */
  async verifyAdmin2FA(
    tempToken: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.verify2FA(tempToken, totpCode, ipAddress, userAgent);
  }

  /**
   * Setup 2FA for admin user
   */
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

    // Generate secret and QR code
    const { secret, qrCode } = await this.twoFactorService.generateSecret(
      user.name,
    );

    // Save secret (but don't enable yet)
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

  /**
   * Enable 2FA after verifying initial code
   */
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

    // Verify token
    const isValid = this.twoFactorService.verifyToken(
      token,
      user.twoFactorSecret,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    // Log action
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

  /**
   * Disable 2FA (requires current password + 2FA code)
   */
  async disable2FA(userId: string, password: string, totpCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Verify TOTP
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const isValid = this.twoFactorService.verifyToken(
        totpCode,
        user.twoFactorSecret,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Log action
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

  /**
   * Find user by ID
   */
  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled || false,
    };
  }
}