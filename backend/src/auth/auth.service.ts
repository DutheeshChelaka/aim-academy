import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async login(phoneNumber: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your phone number first');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
}