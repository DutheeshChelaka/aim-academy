import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Ip,
  Headers,
  UnauthorizedException,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Enable2FADto, Verify2FADto } from './dto/two-factor.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========== REGISTRATION & LOGIN ==========

  @Post('register')
  register(@Body() body: { email: string; phoneNumber: string; password: string; name: string }) {
    return this.authService.register(
      body.email,
      body.phoneNumber,
      body.password,
      body.name,
    );
  }

  @Post('verify-otp')
  verifyOTP(@Body() body: { email: string; code: string }) {
    return this.authService.verifyOTP(body.email, body.code);
  }

  @Post('login')
  async login(
    @Body() body: { identifier: string; password: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(
      body.identifier,
      body.password,
      ip,
      userAgent,
    );
  }

  @Post('resend-otp')
  resendOTP(@Body() body: { email: string }) {
    return this.authService.resendOTP(body.email);
  }

  // ========== GOOGLE OAUTH ==========

  /**
   * Initiate Google OAuth - Passport handles the redirect
   */
// ========== GOOGLE OAUTH ==========

/**
 * Initiate Google OAuth - Manual redirect to avoid guard issues
 */
@Get('google')
async googleAuth(@Query('callback') callback: string, @Res() res: Response) {
  const state = callback ? encodeURIComponent(callback) : '';
  const redirectUri = `${process.env.BACKEND_URL}/auth/google/callback`;
  
  const googleAuthUrl = 
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('email profile')}` +
    `&access_type=offline` +
    (state ? `&state=${state}` : '');
  
  return res.redirect(googleAuthUrl);
}

/**
 * Google OAuth callback - Passport validates here
 */
@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(
  @Request() req: any,
  @Res() res: Response,
  @Query('state') state: string,
) {
  const user = req.user;
  
  // Generate JWT token
  const token = this.authService.generateToken(user.id);
  
  // Get callback URL from state parameter
  const callbackUrl = state ? decodeURIComponent(state) : `${process.env.FRONTEND_URL}/auth/callback`;
  
  // Prepare user data
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    role: user.role,
    avatar: user.avatar,
  };

  // Redirect to frontend
  const frontendUrl = `${callbackUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
  
  return res.redirect(frontendUrl);
}

  // ========== 2FA ENDPOINTS ==========

  @Post('verify-2fa')
  async verify2FA(
    @Body() body: Verify2FADto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verify2FA(
      body.tempToken,
      body.totpCode,
      ip,
      userAgent,
    );
  }

  @Post('admin/login')
  async adminLogin(
    @Body() body: { phoneNumber: string; password: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.adminLogin(
      body.phoneNumber,
      body.password,
      ip,
      userAgent,
    );
  }

  @Post('admin/verify-2fa')
  async verifyAdmin2FA(
    @Body() body: Verify2FADto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verifyAdmin2FA(
      body.tempToken,
      body.totpCode,
      ip,
      userAgent,
    );
  }

  @Post('admin/setup-2fa')
  @UseGuards(JwtAuthGuard)
  async setup2FA(@Request() req) {
    return this.authService.setup2FA(req.user.userId);
  }

  @Post('admin/enable-2fa')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Request() req, @Body() body: Enable2FADto) {
    return this.authService.enable2FA(req.user.userId, body.token);
  }

  @Post('admin/disable-2fa')
  @UseGuards(JwtAuthGuard)
  async disable2FA(
    @Request() req,
    @Body() body: { password: string; totpCode: string },
  ) {
    return this.authService.disable2FA(
      req.user.userId,
      body.password,
      body.totpCode,
    );
  }

  @Get('admin/2fa-status')
  @UseGuards(JwtAuthGuard)
  async get2FAStatus(@Request() req) {
    const user = await this.authService.findUserById(req.user.userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return {
      enabled: user.twoFactorEnabled,
    };
  }

  // ========== PASSWORD RESET ==========

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
  ) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    if (body.newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('validate-reset-token')
  async validateResetToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.validateResetToken(token);
  }
}