import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  /**
   * Generate a new 2FA secret for admin user
   */
  async generateSecret(userName: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `AIM Academy (${userName})`,
      length: 32,
    });

    // Generate QR code for Google Authenticator
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    };
  }

  /**
   * Verify TOTP token
   */
  verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps (±60 seconds)
    });
  }

  /**
   * Generate backup codes (for when user loses phone)
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}