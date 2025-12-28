import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phoneNumber, password, name } = registerDto;

    const existingUser = await this.usersService.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.createUser({
      phoneNumber,
      password: hashedPassword,
      name,
    });

    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.oTP.create({
      data: {
        phoneNumber,
        code: otpCode,
        expiresAt,
      },
    });

    return {
      message: 'Registration successful. OTP sent to your phone.',
      userId: user.id,
      otpCode,
    };
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    const { phoneNumber, code } = verifyOtpDto;

    const otp = await this.prisma.oTP.findFirst({
      where: {
        phoneNumber,
        code,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    const user = await this.usersService.findByPhoneNumber(phoneNumber);
if (user) {
  await this.usersService.updateUser(user.id, { isVerified: true });
}


    return { message: 'Phone number verified successfully' };
  }

  async login(loginDto: LoginDto) {
    const { phoneNumber, password } = loginDto;

    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your phone number first');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, phoneNumber: user.phoneNumber, role: user.role };
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

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}