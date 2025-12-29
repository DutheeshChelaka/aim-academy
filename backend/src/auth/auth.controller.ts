import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { phoneNumber: string; password: string; name: string }) {
    return this.authService.register(
      body.phoneNumber,
      body.password,
      body.name,
    );
  }

  @Post('verify-otp')
  verifyOTP(@Body() body: { phoneNumber: string; code: string }) {
    return this.authService.verifyOTP(
      body.phoneNumber,
      body.code,
    );
  }

  @Post('login')
  login(@Body() body: { phoneNumber: string; password: string }) {
    return this.authService.login(
      body.phoneNumber,
      body.password,
    );
  }

  @Post('resend-otp')
  resendOTP(@Body() body: { phoneNumber: string }) {
    return this.authService.resendOTP(body.phoneNumber);
  }
}