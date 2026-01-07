import { Controller, Post, Body, UseGuards, Request, Get, Ip, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Enable2FADto, Verify2FADto } from './dto/two-factor.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========== UPDATED ENDPOINTS WITH EMAIL ==========

  /**
   * Register - Now requires email
   */
  @Post('register')
  register(@Body() body: { email: string; phoneNumber: string; password: string; name: string }) {
    return this.authService.register(
      body.email,          // ✅ ADD EMAIL
      body.phoneNumber,
      body.password,
      body.name,
    );
  }

  /**
   * Verify OTP - Now uses email
   */
  @Post('verify-otp')
  verifyOTP(@Body() body: { email: string; code: string }) {
    return this.authService.verifyOTP(
      body.email,          // ✅ CHANGED FROM phoneNumber
      body.code,
    );
  }

  /**
   * Login - Accepts email or phone number
   */
  @Post('login')
  async login(
    @Body() body: { identifier: string; password: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(
      body.identifier,     // ✅ Can be email OR phone
      body.password,
      ip,
      userAgent,
    );
  }

  /**
   * Resend OTP - Now uses email
   */
  @Post('resend-otp')
  resendOTP(@Body() body: { email: string }) {
    return this.authService.resendOTP(body.email); // ✅ CHANGED FROM phoneNumber
  }

  // ========== 2FA ENDPOINTS ==========

  /**
   * General 2FA verification (for all users)
   */
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

  /**
   * Admin Login - Enhanced with 2FA
   */
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

  /**
   * Verify 2FA code after admin login
   */
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

  /**
   * Setup 2FA
   */
  @Post('admin/setup-2fa')
  @UseGuards(JwtAuthGuard)
  async setup2FA(@Request() req) {
    return this.authService.setup2FA(req.user.sub);
  }

  /**
   * Enable 2FA
   */
  @Post('admin/enable-2fa')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Request() req, @Body() body: Enable2FADto) {
    return this.authService.enable2FA(req.user.sub, body.token);
  }

  /**
   * Disable 2FA
   */
  @Post('admin/disable-2fa')
  @UseGuards(JwtAuthGuard)
  async disable2FA(
    @Request() req,
    @Body() body: { password: string; totpCode: string },
  ) {
    return this.authService.disable2FA(
      req.user.sub,
      body.password,
      body.totpCode,
    );
  }

  /**
   * Get 2FA status
   */
  @Get('admin/2fa-status')
  @UseGuards(JwtAuthGuard)
  async get2FAStatus(@Request() req) {
    const user = await this.authService.findUserById(req.user.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return {
      enabled: user.twoFactorEnabled,
    };
  }
}