import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isDevelopment: boolean;
  private transporter: nodemailer.Transporter;
  private smtpUser: string;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
    this.smtpUser = this.configService.get<string>('EMAIL_USER') || '';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(this.configService.get<string>('SMTP_PORT') || '587');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

    if (!emailUser || !emailPassword) {
      this.logger.warn('⚠️  Email credentials not configured. Emails will be logged to console.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.logger.log(`✅ Email service initialized: ${emailUser} via ${smtpHost}:${smtpPort}`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize email transporter:', error.message);
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTP(email: string, name: string, otp: string): Promise<boolean> {
    try {
      const subject = 'Your AIM Academy Verification Code';
      
      // Plain text version (important for spam filters)
      const text = `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nAIM Academy Team`;
      
      // Simple HTML version (less spam triggers)
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">AIM Academy</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #dc2626;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br><strong>AIM Academy Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} AIM Academy | Sri Lanka's Leading Online Learning Platform
          </p>
        </div>
      `;

      return await this.sendEmail(email, subject, text, html);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Send password reset email with link
   */
  async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
    try {
      const subject = 'Reset Your AIM Academy Password';
      
      const text = `Hi ${name},\n\nWe received a request to reset your password.\n\nClick here to reset: ${resetLink}\n\nThis link expires in 1 hour and can only be used once.\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nAIM Academy Team`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your AIM Academy account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link:</p>
          <p style="background: #f3f4f6; padding: 10px; word-break: break-all; font-size: 12px;">${resetLink}</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Important:</strong></p>
            <ul style="margin: 10px 0; font-size: 14px;">
              <li>This link expires in 1 hour</li>
              <li>Can only be used once</li>
              <li>Ignore if you didn't request this</li>
            </ul>
          </div>
          <p>Thank you,<br><strong>AIM Academy Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} AIM Academy
          </p>
        </div>
      `;

      return await this.sendEmail(email, subject, text, html);
    } catch (error) {
      this.logger.error(`Failed to send password reset to ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://aimacademy.lk';
      const subject = 'Welcome to AIM Academy!';
      
      const text = `Hi ${name}!\n\nWelcome to AIM Academy! Your account has been successfully verified.\n\nStart learning now: ${frontendUrl}/dashboard\n\nThank you,\nAIM Academy Team`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Welcome to AIM Academy! 🎉</h2>
          <p>Hi ${name}!</p>
          <p>Your account has been successfully verified. Welcome to Sri Lanka's leading online learning platform!</p>
          <h3>What's Next?</h3>
          <ul>
            <li>📚 Explore our extensive library of lessons</li>
            <li>🎥 Watch high-quality video content</li>
            <li>📊 Track your learning progress</li>
            <li>🏆 Achieve your educational goals</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Learning Now</a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Thank you,<br><strong>AIM Academy Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} AIM Academy | Sri Lanka's Leading Online Learning Platform
          </p>
        </div>
      `;

      return await this.sendEmail(email, subject, text, html);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Core email sending function using Nodemailer
   */
  async sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    // Development mode - log to console
    if (this.isDevelopment && !this.transporter) {
      this.logger.log(`📧 [DEV MODE] Email to ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Content: ${text.substring(0, 200)}...`);
      return true;
    }

    // Production mode - send real email
    if (this.transporter) {
      try {
        const mailOptions = {
          from: `"AIM Academy" <${this.smtpUser}>`,
          to,
          subject,
          text, // Plain text version (important!)
          html, // HTML version
        };

        await this.transporter.sendMail(mailOptions);
        this.logger.log(`✅ Email sent to ${to} via ${this.smtpUser}`);
        return true;
      } catch (error: any) {
        this.logger.error(`❌ Failed to send email to ${to}:`, error.message);
        return false;
      }
    }

    this.logger.warn(`⚠️  Email not sent - transporter not configured`);
    return false;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email service status
   */
  getStatus(): { available: boolean; mode: string } {
    if (this.transporter) {
      return {
        available: true,
        mode: this.isDevelopment ? 'development' : 'production',
      };
    }
    return {
      available: false,
      mode: 'console-only',
    };
  }
}